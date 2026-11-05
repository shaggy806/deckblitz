import { defineCard } from "../define.js";

// EDHREC rank 18591.

export default defineCard({
  name: "Karolina Dean, Runaway",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Alien", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your first main phase, add {W}{U}{B}{R}{G}. This mana can't be spent to cast spells from your hand.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { all: ["W", "U", "B", "R", "G"] },
        amount: 1,
        spendOnly: {
          notCastFrom: ["hand"],
          text: "This mana can't be spent to cast spells from your hand.",
        },
      },
      resolve: null,
      text: "At the beginning of your first main phase, add {W}{U}{B}{R}{G}. This mana can't be spent to cast spells from your hand.",
    },
  ],
});
