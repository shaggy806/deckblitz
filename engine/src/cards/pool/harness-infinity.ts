import { defineCard } from "../define.js";

// EDHREC rank 19041. Strixhaven.
//
// `exchange-zones` of the hand and the graveyard (rule 701.12d); "Exile ~"
// closing the spell is `exileOnResolve` — exiled instead of put into the
// graveyard as it finishes resolving (rule 608.2n). Cards put into the
// graveyard this way aren't discarded, nor those put into the hand drawn.
//
// Rulings:
//   [2021-04-16] If either your graveyard or your hand has no cards in it, the exchange still
//     happens. If one of those zones has any cards in it, you will move them to the other zone.
//   [2021-04-16] Cards put into your graveyard this way are not discarded. Any ability that
//     triggers when you discard a card will not trigger.

export default defineCard({
  name: "Harness Infinity",
  manaCost: "{1}{B}{B}{B}{G}{G}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: "Exchange your hand and graveyard.\nExile Harness Infinity.",
  exileOnResolve: true,
  targets: [],
  effect: { kind: "exchange-zones", zones: ["hand", "graveyard"] },
});
