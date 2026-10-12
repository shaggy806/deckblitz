import { defineCard } from "../define.js";

export default defineCard({
  name: "Kozilek's Translator",
  manaCost: "{4}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 5,
  text: "Devoid (This card has no color.)\nPay 1 life: Add {C}. Activate only once each turn. ({C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 1 },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "Pay 1 life: Add {C}. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
