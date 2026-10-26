import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature deals damage to a player, that player discards all the cards in their hand, then draws that many cards.";

export default defineCard({
  name: "Barbed Shocker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${TEXT}`,
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
