import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 3022.

export default defineCard({
  name: "Mogg War Marshal",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Echo {1}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature enters or dies, create a 1/1 red Goblin creature token.",
  triggered: [
    echo("{1}{R}"),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 1 },
      resolve: null,
      text: "When this creature enters or dies, create a 1/1 red Goblin creature token.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 1 },
      resolve: null,
      text: "When this creature enters or dies, create a 1/1 red Goblin creature token.",
    },
  ],
});
