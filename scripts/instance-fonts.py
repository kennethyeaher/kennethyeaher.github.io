#!/usr/bin/env python3
"""rebuild the self-hosted variable fonts, each cut to the weights the site sets.

google fonts serves these families with their full weight axis (newsreader 200 to 800, jetbrains mono 100 to
800, inter and figtree 100 or 300 to 900), but the site only sets a few weights. this script takes google's woff2
files, cuts the wght axis to each family's range with the fonttools instancer, and writes them to public/fonts.
every other axis is kept, so newsreader keeps opsz 6 to 72, except where a family pins one: inter's opsz is pinned
at 14, its text cut. inter and figtree are only used by the live specimens (src/components/exhibits/specimens), so
they ship latin only. inter's specimen text is 9 to 13px on a half size stage and 11 to 17px on phones, with one
21 to 28px title (SpecimenTerpcareMood.astro, SpecimenSohiveRsvp.astro); with optical sizing on auto, everything at
14px or under already drew at opsz 14, so pinning it changes only the larger text slightly and takes the latin file
from 52,352 to 35,964 bytes. fraunces is left alone: narrowing its axis moved glyph widths and rewrapped a
heading (see the note above the @font-face rules in src/styles/global.css).

this is a manual tool, not part of the build. run it when the google files change, then rerun the tests and
check the fallback metrics in global.css still hold.

    python3 -m pip install fonttools brotli
    python3 scripts/instance-fonts.py                  # fetch from google fonts, write to public/fonts
    python3 scripts/instance-fonts.py --source DIR     # use files already in DIR, named like the outputs
    python3 scripts/instance-fonts.py --out DIR        # write somewhere else, to compare before replacing
    python3 scripts/instance-fonts.py --family inter   # rebuild one family, by its folder name
"""

import argparse
import io
import re
import sys
import urllib.request
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent

# the two subsets the site text ships in; it has no greek, cyrillic or vietnamese text.
SUBSETS = ("latin", "latin-ext")

# family name in the google fonts css2 api, the axes to ask for, the folder and file prefix in public/fonts, the
# weight range the site uses (matching font-weight in its @font-face rule), the subsets that ship and any axes
# pinned to one value (dropped from the font).
# newsreader and jetbrains mono: font-weight 400 500 in global.css. inter and figtree: the specimen faces in
# src/components/exhibits/specimens/SpecimenFonts.astro, which set inter 500 to 700 and figtree 400 to 700.
FAMILIES = [
    ("Newsreader", "opsz,wght@6..72,200..800", "newsreader", (400, 500), SUBSETS, {}),
    ("JetBrains Mono", "wght@100..800", "jetbrains-mono", (400, 500), SUBSETS, {}),
    ("Inter", "opsz,wght@14..32,100..900", "inter", (500, 700), ("latin",), {"opsz": 14}),
    ("Figtree", "wght@300..900", "figtree", (400, 700), ("latin",), {}),
]

# google picks the font format from the user agent; a current chrome gets woff2.
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)


def fetch(url):
    """return the body of url as bytes, sent with a chrome user agent."""
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def google_sources(family, axes, subsets):
    """map each shipped subset to its woff2 url, read from the google fonts css2 stylesheet for family."""
    query = family.replace(" ", "+")
    css = fetch(f"https://fonts.googleapis.com/css2?family={query}:{axes}&display=swap").decode("utf-8")
    # each @font-face block is preceded by a comment naming its subset, for example /* latin-ext */.
    blocks = re.findall(r"/\*\s*([\w-]+)\s*\*/\s*@font-face\s*\{([^}]*)\}", css)
    urls = {}
    for subset, body in blocks:
        match = re.search(r"src:\s*url\((https://[^)]+\.woff2)\)", body)
        if subset in subsets and match:
            urls[subset] = match.group(1)
    missing = [subset for subset in subsets if subset not in urls]
    if missing:
        sys.exit(f"google fonts returned no {', '.join(missing)} woff2 for {family}")
    return urls


def load_source(prefix, subset, source_dir, urls):
    """open the full range variable font for one subset, from source_dir or from its google fonts url."""
    if source_dir:
        path = Path(source_dir) / f"{prefix}-{subset}.woff2"
        if not path.exists():
            sys.exit(f"missing source file {path}")
        return TTFont(path)
    return TTFont(io.BytesIO(fetch(urls[subset])))


def axis_ranges(font):
    """return the font's variation axes as {tag: (min, max)}, for the log and the checks."""
    return {axis.axisTag: (axis.minValue, axis.maxValue) for axis in font["fvar"].axes}


def limit_axes(font, weight, pins):
    """cut the wght axis to weight in place of the full range and pin each axis in pins to its one value, keeping
    every other axis as it is."""
    ranges = axis_ranges(font)
    low, high = ranges["wght"]
    if low > weight[0] or high < weight[1]:
        sys.exit(f"source wght {low:g} to {high:g} does not cover {weight[0]} to {weight[1]}")
    for tag, value in pins.items():
        if tag not in ranges or not ranges[tag][0] <= value <= ranges[tag][1]:
            sys.exit(f"source has no {tag} axis covering {value}")
    return instantiateVariableFont(font, {"wght": weight, **pins}, inplace=False)


def main():
    """rebuild every family and subset and write the woff2 files."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--source", help="folder of full range woff2 files named like the outputs, instead of google fonts")
    parser.add_argument("--out", default=str(ROOT / "public" / "fonts"), help="folder to write into (default public/fonts)")
    parser.add_argument("--family", action="append", help="only rebuild this family, by folder name (repeatable)")
    args = parser.parse_args()

    for family, axes, prefix, weight, subsets, pins in FAMILIES:
        if args.family and prefix not in args.family:
            continue
        urls = None if args.source else google_sources(family, axes, subsets)
        for subset in subsets:
            source = load_source(prefix, subset, args.source, urls)
            before = axis_ranges(source)
            font = limit_axes(source, weight, pins)
            after = axis_ranges(font)
            # the instancer should only have touched wght and dropped the pinned axes.
            assert after["wght"] == weight, after
            kept = {tag: span for tag, span in before.items() if tag != "wght" and tag not in pins}
            assert {tag: span for tag, span in after.items() if tag != "wght"} == kept, after

            target = Path(args.out) / prefix / f"{prefix}-{subset}.woff2"
            target.parent.mkdir(parents=True, exist_ok=True)
            font.flavor = "woff2"
            font.save(target)
            pinned = "".join(f", {tag} {value:g}" for tag, value in pins.items())
            print(f"{target}: wght {before['wght'][0]:g} to {before['wght'][1]:g} -> {weight[0]} to {weight[1]}{pinned}, {target.stat().st_size} bytes")


if __name__ == "__main__":
    main()
