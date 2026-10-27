import { defineCard } from "../define.js";

// EDHREC rank 28053.
//
// The card is chosen at random as the spell resolves (`choose-random-card`,
// Deadbridge Chant's shape): an opponent "choosing at random" picks with the
// same equal chance as anyone, and reordering the graveyard at random first
// changes nothing the engine reads. A creature card is put onto the
// battlefield (under its owner's — the caster's — control); anything else is
// exiled.

export default defineCard({
  name: "Search for Survivors",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Reorder your graveyard at random. An opponent chooses a card at random in your graveyard. If it's a creature card, put it onto the battlefield. Otherwise, exile it.",
  effect: {
    kind: "choose-random-card",
    zone: "graveyard",
    then: {
      kind: "conditional",
      condition: { kind: "target", index: 0, filter: { type: "creature" } },
      then: { kind: "put-onto-battlefield", target: 0 },
      else: { kind: "exile", target: 0 },
    },
  },
});
