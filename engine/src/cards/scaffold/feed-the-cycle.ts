import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 7615.
//
// Rulings:
//   [2024-07-26] If you don't have enough cards in your graveyard or a Food on the battlefield,
//     you can't choose to forage.
//   [2024-07-26] Once you announce that you're casting a spell or activating an ability, players
//     can't take actions until you've finished doing so. Notably, opponents can't try to remove
//     cards from your graveyard or Foods you control to stop you from foraging.
//   [2024-11-08] Whatever you do, don't eat the delicious cards.
//   [2024-11-08] You can't sacrifice a Food to pay multiple costs. For example, you can't
//     sacrifice a Food token to activate its own ability and also to activate Maraleaf Rider's
//     ability.
//   [2024-11-08] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.

export default defineCard({
  name: "Feed the Cycle",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, forage or pay {B}. (To forage, exile three cards from your graveyard or sacrifice a Food.)\nDestroy target creature or planeswalker.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  // TODO(scaffold): As an additional cost to cast ~, forage or pay {B}.
  // TODO(scaffold): (parsed "Destroy target creature or planeswalker." as {"kind":"destroy","target":0})
});
