import { defineCard } from "../define.js";


export default defineCard({
  name: "Mindmelter",
  manaCost: "{1}{U}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 2,
  text: "Devoid (This card has no color.)\nThis creature can't be blocked.\n{3}{C}: Target opponent exiles a card from their hand. Activate only as a sorcery. ({C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: "{3}{C}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 1,
          max: 1,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      resolve: null,
      text: "{3}{C}: Target opponent exiles a card from their hand. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
