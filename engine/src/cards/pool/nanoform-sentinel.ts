import { defineCard } from "../define.js";

// EDHREC rank 12211.

const TEXT =
  "Whenever this creature becomes tapped, untap another target permanent. This ability triggers only once each turn.";

export default defineCard({
  name: "Nanoform Sentinel",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      oncePerTurn: true,
      targets: [{ kind: "other", of: "permanent" }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
