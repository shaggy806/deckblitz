import { defineCard } from "../define.js";

export default defineCard({
  name: "Satyr Firedancer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Satyr"],
  power: 1,
  toughness: 1,
  text: "Whenever an instant or sorcery spell you control deals damage to an opponent, this creature deals that much damage to target creature that player controls.",
  triggered: [
    {
      trigger: {
        on: "deals-damage",
        who: "you-control",
        filter: { typesAnyOf: ["instant", "sorcery"] },
        to: "opponent",
      },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: "Whenever an instant or sorcery spell you control deals damage to an opponent, this creature deals that much damage to target creature that player controls.",
    },
  ],
});
