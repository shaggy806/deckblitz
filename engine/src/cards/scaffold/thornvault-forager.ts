import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 3297.
//
// Rulings:
//   [2024-07-26] Once you announce that you're casting a spell or activating an ability, players
//     can't take actions until you've finished doing so. Notably, opponents can't try to remove
//     cards from your graveyard or Foods you control to stop you from foraging.
//   [2024-07-26] If you don't have enough cards in your graveyard or a Food on the battlefield,
//     you can't choose to forage.
//   [2024-11-08] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2024-11-08] Whatever you do, don't eat the delicious cards.
//   [2024-11-08] You can't sacrifice a Food to pay multiple costs. For example, you can't
//     sacrifice a Food token to activate its own ability and also to activate Maraleaf Rider's
//     ability.

export default defineCard({
  name: "Thornvault Forager",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Squirrel", "Ranger"],
  power: 2,
  toughness: 2,
  text: "{T}: Add {G}.\n{T}, Forage: Add two mana in any combination of colors. (To forage, exile three cards from your graveyard or sacrifice a Food.)\n{3}{G}, {T}: Search your library for a Squirrel card, reveal it, put it into your hand, then shuffle.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
    {
      cost: { mana: "{3}{G}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Squirrel" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: "{3}{G}, {T}: Search your library for a Squirrel card, reveal it, put it into your hand, then shuffle.",
    },
  ],
  // TODO(scaffold): {T}, Forage: Add two mana in any combination of colors.
});
