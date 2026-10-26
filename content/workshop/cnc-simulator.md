+++
date = '2026-10-26T00:00:00+08:00'
title = 'Little Mill — CNC Simulator'
description = 'A Godot-based manufacturing demo for toolpath planning and simulated machining.'
image = "/images/cnc-simulator.png"
+++

---

## From Model to Machined Part

Little Mill is a Godot-based manufacturing prototype that takes a target model through process planning, simulated cutting, and result inspection.

### Features

- Import STEP, STL, and OBJ models in the workbench.
- Generate toolpaths and preview the machining process.
- Watch material being removed from stock, with tool changes and workpiece repositioning.
- Inspect the finished part and compare remaining material and overcuts against the target.

![Target model in the Little Mill web demo](/images/cnc-simulator-model.png)

[Online Demo](https://eric-schecter.github.io/little-mill/)

### Open-source Dependencies

- [Godot Engine](https://godotengine.org/) — application framework and 3D rendering. MIT.
- [godot-cpp](https://github.com/godotengine/godot-cpp) — C++ bindings for the native geometry extension. MIT.
- [Manifold](https://github.com/elalish/manifold) — solid modeling and boolean operations for material removal. Apache-2.0.
- [OpenCAMLib](https://github.com/aewallin/opencamlib) — surface toolpath calculations. LGPL-2.1-or-later.
- [Clipper2](https://github.com/AngusJohnson/Clipper2) — polygon clipping and offsetting for layered pocket toolpaths. Boost Software License 1.0.
- [Boost](https://www.boost.org/) — supporting C++ libraries used by OpenCAMLib. Boost Software License 1.0.
- [oneTBB](https://github.com/uxlfoundation/oneTBB) — parallel geometry processing in the native build; the web build uses a serial Manifold backend. Apache-2.0.
- [Noto Sans CJK](https://github.com/notofonts/noto-cjk) — interface typography. SIL Open Font License 1.1.

[Third-party Notices](https://eric-schecter.github.io/little-mill/licenses/)
