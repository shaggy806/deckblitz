import { defineCard } from "../define.js";

export default defineCard({
  name: "Essence Depleter",
  manaCost: "{2}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 3,
  text: "Devoid (This card has no color.)\n{1}{C}: Target opponent loses 1 life and you gain 1 life. ({C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: "{1}{C}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      resolve: null,
      text: "{1}{C}: Target opponent loses 1 life and you gain 1 life.",
    },
  ],
});
