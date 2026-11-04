import { defineCard } from "../define.js";

// Devoid: colourless (`colors: []`).

const SPEND =
  "Spend this mana only to cast a colorless spell, activate an ability of a colorless permanent, or pay a cost that contains {C}.";

export default defineCard({
  name: "Cultivator Drone",
  manaCost: "{2}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 3,
  text: `Devoid (This card has no color.)\n{T}: Add {C}. ${SPEND} ({C} represents colorless mana.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spendOnly: { spell: { colorless: true }, abilityOf: { colorless: true }, purposes: ["cost-with-c"], text: SPEND },
      },
      resolve: null,
      text: `{T}: Add {C}. ${SPEND}`,
    },
  ],
});
