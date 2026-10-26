import { defineCard } from "../define.js";

// EDHREC rank 27444.

export default defineCard({
  name: "Minamo Sightbender",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{X}, {T}: Target creature with power X or less can't be blocked this turn.",
  activated: [
    {
      // Entrancing Lyre's {X} target filter, Access Tunnel's effect.
      cost: { mana: "{X}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: "x" } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{X}, {T}: Target creature with power X or less can't be blocked this turn.",
    },
  ],
});
