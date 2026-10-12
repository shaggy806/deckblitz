import { defineCard } from "../define.js";

export default defineCard({
  name: "Mardu Warshrieker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Shaman"],
  power: 3,
  toughness: 3,
  text: "Raid — When this creature enters, if you attacked this turn, add {R}{W}{B}.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["R", "W", "B"] }, amount: 1 },
      resolve: null,
      text: "Raid — When this creature enters, if you attacked this turn, add {R}{W}{B}.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
