import { defineCard } from "../define.js";

export default defineCard({
  name: "Nightsquad Commando",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: "When this creature enters, if you attacked this turn, create a 1/1 white Human Soldier creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: "When this creature enters, if you attacked this turn, create a 1/1 white Human Soldier creature token.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
