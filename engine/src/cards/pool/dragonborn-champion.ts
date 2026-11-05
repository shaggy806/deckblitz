import { defineCard } from "../define.js";

// EDHREC rank 3645.

export default defineCard({
  name: "Dragonborn Champion",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dragon", "Warrior"],
  power: 5,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nWhenever a source you control deals 5 or more damage to a player, draw a card.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", to: "player", atLeast: 5 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a source you control deals 5 or more damage to a player, draw a card.",
    },
  ],
});
