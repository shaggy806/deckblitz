import { defineCard } from "../define.js";

// EDHREC rank 3194. Exile one face down with a permission only its controller
// has, for as long as it stays exiled, any type of mana; the rest to its
// owner's graveyard.
export default defineCard({
  name: "Thief of Sanity",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature deals combat damage to a player, look at the top three cards of that player's library, exile one of them face down, then put the rest into their graveyard. You may cast that card for as long as it remains exiled, and mana of any type can be spent to cast that spell.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        from: "trigger-player",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "exile-face-down",
        unlinked: true,
        mayPlay: { duration: "while-exiled", spendAs: "any-type" },
        leftover: "graveyard",
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, look at the top three cards of that player's library, exile one of them face down, then put the rest into their graveyard. You may cast that card for as long as it remains exiled, and mana of any type can be spent to cast that spell.",
    },
  ],
});
