import { defineCard } from "../define.js";

// EDHREC rank 21408. Setessan Petitioner's trigger.

export default defineCard({
  name: "Nylea's Disciple",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Archer"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, you gain life equal to your devotion to green. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { devotionTo: "G" } },
      resolve: null,
      text: "When this creature enters, you gain life equal to your devotion to green.",
    },
  ],
});
