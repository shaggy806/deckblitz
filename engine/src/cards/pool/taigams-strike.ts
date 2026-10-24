import { defineCard } from "../define.js";

// EDHREC rank 21017. Distortion Strike's shape.
export default defineCard({
  name: "Taigam's Strike",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  rebound: true,
  text:
    "Target creature gets +2/+0 until end of turn and can't be blocked this turn.\n" +
    "Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
    ],
  },
});
