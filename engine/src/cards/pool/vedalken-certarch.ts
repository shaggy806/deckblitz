import { defineCard } from "../define.js";

// EDHREC rank 27519. Mox Opal's metalcraft activation gate (rule 602.5).

const TEXT =
  "Metalcraft — {T}: Tap target artifact, creature, or land. Activate only if you control three or more artifacts.";

export default defineCard({
  name: "Vedalken Certarch",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      condition: { kind: "metalcraft" },
      text: TEXT,
    },
  ],
});
