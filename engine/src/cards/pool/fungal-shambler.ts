import { defineCard } from "../define.js";

// EDHREC rank 30304. Zhang Liao's trigger (any damage, not only combat), with
// the draw added.

const TEXT = "Whenever this creature deals damage to an opponent, you draw a card and that opponent discards a card.";

export default defineCard({
  name: "Fungal Shambler",
  manaCost: "{4}{B}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["creature"],
  subtypes: ["Fungus", "Beast"],
  power: 6,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "trigger-player", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
