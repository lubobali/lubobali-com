# One-off font trim (Phase 3 H12), run by hand, NOT part of the build.
# Input: the original @fontsource-variable/inter-tight 5.3.0 latin file
# (sha256 77fefe8c..., see src/app/fonts/README.md). Output: weights 400-600
# only (still variable) + Latin-1, punctuation, arrows, euro, all OpenType
# features. 45 KB -> 26 KB. Needs: pip install fonttools==4.61.1 brotli
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
f = TTFont("InterTight-latin-wght.woff2")
print("axes:", [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in f["fvar"].axes], "glyphs", len(f.getGlyphOrder()))
f = instancer.instantiateVariableFont(f, {"wght": (400, 600)})
f.flavor = None
f.save("/tmp/inter-tight-inst.ttf")
f = TTFont("/tmp/inter-tight-inst.ttf", lazy=False)
opts = subset.Options()
opts.layout_features = ["*"]
opts.flavor = "woff2"
opts.name_IDs = ["*"]
opts.notdef_outline = True
unicodes = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [0x131, 0x152, 0x153, 0x2C6, 0x2DA, 0x2DC] + list(range(0x2000, 0x2070)) + [0x20AC, 0x2122, 0x2212, 0x2215] + list(range(0x2190, 0x219A))
s = subset.Subsetter(opts); s.populate(unicodes=unicodes); s.subset(f)
f.flavor = "woff2"; f.save("InterTight-latin-wght400-600.woff2")
g = TTFont("InterTight-latin-wght400-600.woff2")
print("new axes:", [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in g["fvar"].axes], "glyphs", len(g.getGlyphOrder()))
