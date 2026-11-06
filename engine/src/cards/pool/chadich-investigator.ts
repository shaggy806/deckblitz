import { defineCard } from "../define.js";

// EDHREC rank 31853.
// Makes Klingon Warrior → use "Klingon Warrior Token".

export default defineCard({
  name: "Cha'DIch Investigator",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, create a 2/1 red Klingon Warrior creature token with haste.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Klingon Warrior Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 2/1 red Klingon Warrior creature token with haste.",
    },
  ],
});
