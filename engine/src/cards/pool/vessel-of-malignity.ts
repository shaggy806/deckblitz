import { defineCard } from "../define.js";


export default defineCard({
  name: "Vessel of Malignity",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "{1}{B}, Sacrifice this enchantment: Target opponent exiles two cards from their hand. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      targets: ["opponent"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 2,
          max: 2,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      resolve: null,
      text: "{1}{B}, Sacrifice this enchantment: Target opponent exiles two cards from their hand. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
