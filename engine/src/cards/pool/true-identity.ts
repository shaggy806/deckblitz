import { defineCard } from "../define.js";

const TEXT =
  "Whenever this enchantment or another permanent you control is turned face up, scry 1, then draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "True Identity",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  morph: { keyword: "disguise", cost: "{W}" },
  text: `${TEXT}\nDisguise {W} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)`,
  triggered: [
    {
      // "This enchantment or another permanent you control": any permanent
      // you control, this one included (Cryptid Inspector's shape — turned
      // face up, it has this ability from then on, rule 708.8).
      trigger: { on: "turned-face-up", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
