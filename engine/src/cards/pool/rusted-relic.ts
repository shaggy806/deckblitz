import { defineCard } from "../define.js";

// EDHREC rank 25581.

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
      condition: { kind: "metalcraft" },
      addTypes: ["creature"],
      addSubtypes: ["Golem"],
      setBasePt: { power: 5, toughness: 5 },
      text: TEXT,
    },
  ],
});
