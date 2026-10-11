#!/usr/bin/env python3
"""rebuild the self-hosted newsreader and jetbrains mono files, limited to wght 400 to 500.

google fonts serves both families with their full weight axis (newsreader 200 to 800, jetbrains mono 100 to
800), but the site only sets 400 and 500. this script takes google's latin and latin-ext woff2 files, cuts the
wght axis to 400 to 500 with the fonttools instancer, and writes them to public/fonts. every other axis is kept,
so newsreader keeps opsz 6 to 72. fraunces is left alone: narrowing its axis moved glyph widths and rewrapped a
heading (see the note above the @font-face rules in src/styles/global.css).

this is a manual tool, not part of the build. run it when the google files change, then rerun the tests and
check the fallback metrics in global.css still hold.

    python3 -m pip install fonttools brotli
    python3 scripts/instance-fonts.py                  # fetch from google fonts, write to public/fonts
    python3 scripts/instance-fonts.py --source DIR     # use files already in DIR, named like the outputs
    python3 scripts/instance-fonts.py --out DIR        # write somewhere else, to compare before replacing
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

# the weight range the site uses; font-weight: 400 500 in global.css matches it.
WEIGHT = (400, 500)

# family name in the google fonts css2 api, the axes to ask for, and the folder and file prefix in public/fonts.
FAMILIES = [
    ("Newsreader", "opsz,wght@6..72,200..800", "newsreader"),
    ("JetBrains Mono", "wght@100..800", "jetbrains-mono"),
]

# the two subsets that ship; the site has no greek, cyrillic or vietnamese text.
SUBSETS = ("latin", "latin-ext")

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


def google_sources(family, axes):
    """map each shipped subset to its woff2 url, read from the google fonts css2 stylesheet for family."""
    query = family.replace(" ", "+")
    css = fetch(f"https://fonts.googleapis.com/css2?family={query}:{axes}&display=swap").decode("utf-8")
    # each @font-face block is preceded by a comment naming its subset, for example /* latin-ext */.
    blocks = re.findall(r"/\*\s*([\w-]+)\s*\*/\s*@font-face\s*\{([^}]*)\}", css)
    urls = {}
    for subset, body in blocks:
        match = re.search(r"src:\s*url\((https://[^)]+\.woff2)\)", body)
        if subset in SUBSETS and match:
            urls[subset] = match.group(1)
    missing = [subset for subset in SUBSETS if subset not in urls]
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


def limit_weight(font):
    """cut the wght axis to WEIGHT in place of the full range, keeping every other axis as it is."""
    low, high = axis_ranges(font)["wght"]
    if low > WEIGHT[0] or high < WEIGHT[1]:
        sys.exit(f"source wght {low:g} to {high:g} does not cover {WEIGHT[0]} to {WEIGHT[1]}")
    return instantiateVariableFont(font, {"wght": WEIGHT}, inplace=False)


def main():
    """rebuild every family and subset and write the woff2 files."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--source", help="folder of full range woff2 files named like the outputs, instead of google fonts")
    parser.add_argument("--out", default=str(ROOT / "public" / "fonts"), help="folder to write into (default public/fonts)")
    args = parser.parse_args()

    for family, axes, prefix in FAMILIES:
        urls = None if args.source else google_sources(family, axes)
        for subset in SUBSETS:
            source = load_source(prefix, subset, args.source, urls)
            before = axis_ranges(source)
            font = limit_weight(source)
            after = axis_ranges(font)
            # the instancer should only have touched wght.
            assert after["wght"] == WEIGHT, after
            assert {tag: span for tag, span in after.items() if tag != "wght"} == {tag: span for tag, span in before.items() if tag != "wght"}

            target = Path(args.out) / prefix / f"{prefix}-{subset}.woff2"
            target.parent.mkdir(parents=True, exist_ok=True)
            font.flavor = "woff2"
            font.save(target)
            print(f"{target}: wght {before['wght'][0]:g} to {before['wght'][1]:g} -> {WEIGHT[0]} to {WEIGHT[1]}, {target.stat().st_size} bytes")


if __name__ == "__main__":
    main()
