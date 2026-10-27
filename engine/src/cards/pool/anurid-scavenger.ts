import { defineCard } from "../define.js";

// "Sacrifice this unless you put a card from your graveyard on the bottom of
// your library": with a card there, you choose — put one (which one is yours
// too) or sacrifice; with none, there's nothing to put and it's sacrificed.

export default defineCard({
  name: "Anurid Scavenger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Beast"],
  power: 3,
  toughness: 3,
  text: "Protection from black\nAt the beginning of your upkeep, sacrifice this creature unless you put a card from your graveyard on the bottom of your library.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Put a card from your graveyard on the bottom of your library? (If you don't, sacrifice Anurid Scavenger.)",
          effect: {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 1,
            max: 1,
            destination: "library-bottom",
            leftover: "stay",
          },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice this creature unless you put a card from your graveyard on the bottom of your library.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
