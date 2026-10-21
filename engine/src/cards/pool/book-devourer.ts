import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature deals combat damage to a player, you may discard all the cards in your hand. If you do, draw that many cards.";

export default defineCard({
  name: "Book Devourer",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard all the cards in your hand, then draw that many cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard-hand", who: "you" },
            { kind: "draw", amount: { thisWay: "discarded" } },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
