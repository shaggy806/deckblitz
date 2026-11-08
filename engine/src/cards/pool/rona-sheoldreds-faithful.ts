import { defineCard } from "../define.js";

// EDHREC rank 13501.

export default defineCard({
  name: "Rona, Sheoldred's Faithful",
  manaCost: "{1}{U}{B}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  mayPlaySelf: { from: ["graveyard"], discard: 2 },
  text: "Whenever you cast an instant or sorcery spell, each opponent loses 1 life.\nYou may cast this card from your graveyard by discarding two cards in addition to paying its other costs.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, each opponent loses 1 life.",
    },
  ],
});
