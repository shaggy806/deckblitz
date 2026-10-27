import { defineCard } from "../define.js";

// EDHREC rank 30833.

export default defineCard({
  name: "Spellgorger Barbarian",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Nightmare", "Barbarian"],
  power: 3,
  toughness: 1,
  text: "When this creature enters, discard a card at random.\nWhen this creature leaves the battlefield, draw a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "you", amount: 1, random: true },
      resolve: null,
      text: "When this creature enters, discard a card at random.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature leaves the battlefield, draw a card.",
    },
  ],
});
