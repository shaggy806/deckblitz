import { defineCard } from "../define.js";

// EDHREC rank 2810.

export default defineCard({
  name: "Alseid of Life's Bounty",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: "Lifelink\n{1}, Sacrifice this creature: Target creature or enchantment you control gains protection from the color of your choice until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { typesAnyOf: ["creature", "enchantment"] },
        },
      ],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}, Sacrifice this creature: Target creature or enchantment you control gains protection from the color of your choice until end of turn.",
    },
  ],
});
