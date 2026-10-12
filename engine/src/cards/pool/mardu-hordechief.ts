import { defineCard } from "../define.js";

export default defineCard({
  name: "Mardu Hordechief",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 3,
  text: "Raid — When this creature enters, if you attacked this turn, create a 1/1 white Warrior creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Warrior Token", count: 1 },
      resolve: null,
      text: "Raid — When this creature enters, if you attacked this turn, create a 1/1 white Warrior creature token.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
