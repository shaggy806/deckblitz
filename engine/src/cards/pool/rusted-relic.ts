import { defineCard } from "../define.js";

// EDHREC rank 25581. Warden of the Wall's self-animating static, gated on
// metalcraft. Written as a `controls` count with `countsSelf`, not the
// `metalcraft` condition: a static's `metalcraft` scan leaves its own
// permanent out, and Rusted Relic is one of the three artifacts.

const TEXT =
  "Metalcraft — This artifact is a 5/5 Golem artifact creature as long as you control three or more artifacts.";

export default defineCard({
  name: "Rusted Relic",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 3, countsSelf: true },
      addTypes: ["creature"],
      addSubtypes: ["Golem"],
      setBasePt: { power: 5, toughness: 5 },
      text: TEXT,
    },
  ],
});
