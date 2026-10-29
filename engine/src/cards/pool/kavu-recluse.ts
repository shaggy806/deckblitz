import { defineCard } from "../define.js";

// Rule 305.7: the land loses its other land types and its rules-text
// abilities until end of turn, and taps for {G}.
export default defineCard({
  name: "Kavu Recluse",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 2,
  text: "{T}: Target land becomes a Forest until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Forest"], duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target land becomes a Forest until end of turn.",
    },
  ],
});
