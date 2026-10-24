import { defineCard } from "../define.js";

// EDHREC rank 12705.
// Makes Demon → use "5/5 Demon Token".

export default defineCard({
  name: "Priest of the Blood Rite",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, create a 5/5 black Demon creature token with flying.\nAt the beginning of your upkeep, you lose 2 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "5/5 Demon Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 5/5 black Demon creature token with flying.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 2 },
      resolve: null,
      text: "At the beginning of your upkeep, you lose 2 life.",
    },
  ],
});
