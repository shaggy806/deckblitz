import { defineCard } from "../define.js";

const COMBAT_TEXT =
  "At the beginning of combat on your turn, if you control one or more Eggs, sacrifice an Egg, then create a 3/3 green Dinosaur creature token.";

export default defineCard({
  name: "Palani's Hatcher",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 3,
  text: `Other Dinosaurs you control have haste.\nWhen this creature enters, create two 0/1 green Dinosaur Egg creature tokens.\n${COMBAT_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Dinosaur" },
      grantKeywords: ["haste"],
      text: "Other Dinosaurs you control have haste.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Dinosaur Egg Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 0/1 green Dinosaur Egg creature tokens.",
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      // Any Egg, not just this card's tokens (the ruling).
      condition: { kind: "controls", filter: { subtype: "Egg" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { subtype: "Egg" }, count: 1 },
          { kind: "create-token", token: "3/3 Dinosaur Token", count: 1 },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
