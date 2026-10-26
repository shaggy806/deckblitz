import { defineCard } from "../define.js";

// EDHREC rank 22263.

const TEXT =
  "Whenever this creature deals damage to a player, that player discards all the cards in their hand, then draws that many cards.";

export default defineCard({
  name: "Shocker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "trigger-player" },
          { kind: "draw", who: "trigger-player", amount: { thisWay: "discarded" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
