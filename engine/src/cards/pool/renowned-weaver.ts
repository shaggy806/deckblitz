import { defineCard } from "../define.js";

export default defineCard({
  name: "Renowned Weaver",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  text: "{1}{G}, Sacrifice this creature: Create a 1/3 green Spider enchantment creature token with reach. (It can block creatures with flying.)",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "1/3 Green Enchantment Spider Token (Reach)", count: 1 },
      resolve: null,
      text: "{1}{G}, Sacrifice this creature: Create a 1/3 green Spider enchantment creature token with reach.",
    },
  ],
});
