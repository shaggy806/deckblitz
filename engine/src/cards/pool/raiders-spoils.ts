import { defineCard } from "../define.js";

// EDHREC rank 14032.
// The 1 life is paid, or not, as each Warrior's trigger resolves — once per
// trigger (the ruling).
const ANTHEM_TEXT = "Creatures you control get +1/+0.";
const DRAW_TEXT =
  "Whenever a Warrior you control deals combat damage to a player, you may pay 1 life. If you do, draw a card.";

export default defineCard({
  name: "Raiders' Spoils",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ANTHEM_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [1, 0],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", subtype: "Warrior" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 1 life to draw a card?",
        costLife: 1,
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
