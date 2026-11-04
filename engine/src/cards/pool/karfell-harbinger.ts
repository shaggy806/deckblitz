import { defineCard } from "../define.js";

const SPEND = "Spend this mana only to foretell a card from your hand or cast an instant or sorcery spell.";

export default defineCard({
  name: "Karfell Harbinger",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 1,
  toughness: 3,
  text: `{T}: Add {U}. ${SPEND}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        spendOnly: { spell: { typesAnyOf: ["instant", "sorcery"] }, purposes: ["foretell"], text: SPEND },
      },
      resolve: null,
      text: `{T}: Add {U}. ${SPEND}`,
    },
  ],
});
