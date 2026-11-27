import { defineCard } from "../define.js";

export default defineCard({
  name: "Aggression",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant non-Wall creature\nEnchanted creature has first strike and trample.\nAt the beginning of the end step of enchanted creature's controller, destroy that creature if it didn't attack this turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Wall"] } }],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike", "trample"],
      text: "Enchanted creature has first strike and trample.",
    },
  ],
  triggered: [
    {
      // "That creature": the one enchanted as it triggered — moving the Aura
      // afterwards changes nothing (the ruling).
      trigger: { on: "step-begins", step: "end", who: "attached" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "object-matches", object: "attached-as-triggered", filter: { attackedThisTurn: false } },
        then: { kind: "destroy", target: "attached-as-triggered" },
      },
      resolve: null,
      text: "At the beginning of the end step of enchanted creature's controller, destroy that creature if it didn't attack this turn.",
    },
  ],
});
