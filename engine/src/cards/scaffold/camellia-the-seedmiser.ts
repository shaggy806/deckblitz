import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 2755.
// Makes Squirrel → use "Squirrel Token".
//
// Rulings:
//   [2024-11-08] You can't sacrifice a Food to pay multiple costs. For example, you can't
//     sacrifice a Food token to activate its own ability and also to activate Maraleaf Rider's
//     ability.
//   [2024-11-08] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2024-11-08] Whatever you do, don't eat the delicious cards.

export default defineCard({
  name: "Camellia, the Seedmiser",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Squirrel", "Warlock"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace\nOther Squirrels you control have menace.\nWhenever you sacrifice one or more Foods, create a 1/1 green Squirrel creature token.\n{2}, Forage: Put a +1/+1 counter on each other Squirrel you control. (To forage, exile three cards from your graveyard or sacrifice a Food.)",
  // TODO(scaffold): Other Squirrels you control have menace.
  // TODO(scaffold): Whenever you sacrifice one or more Foods, create a 1/1 green Squirrel creature token.
  // TODO(scaffold): {2}, Forage: Put a +1/+1 counter on each other Squirrel you control.
});
