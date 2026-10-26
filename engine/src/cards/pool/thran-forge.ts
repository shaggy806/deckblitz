import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 21472.
//
// A second activation on the same creature, resolving first, makes the first
// one's target illegal (no longer nonartifact) — its ruling: the target is
// rechecked as the ability resolves.

const TEXT =
  "{2}: Until end of turn, target nonartifact creature gets +1/+0 and becomes an artifact in addition to its other types.";

export default defineCard({
  name: "Thran Forge",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["nonartifact-creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "add-types", target: 0, addTypes: ["artifact"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
