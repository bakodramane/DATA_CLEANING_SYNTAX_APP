# Adding a Renderer

Renderers convert a language-neutral Cleaning Plan into version-aware syntax.

A renderer should:

- preserve the Cleaning Plan order
- add comments before every substantive step
- include rationales and citation keys
- warn when a step is partially supported or unsupported
- avoid silent deletion or overwriting
- generate reproducible code

Phase 2 will introduce the first renderer for R. Phase 3 will add SPSS, Stata,
and Python renderers.
