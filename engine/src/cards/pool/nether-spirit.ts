import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 25575.
//
// Rulings:
//   If Nether Spirit isn't the only creature card in your graveyard as your upkeep begins, its
//     ability won't trigger.
//   If you have two Nether Spirits in your graveyard, they stop each other from returning.
//   If Nether Spirit isn't the only creature card in your graveyard as its ability resolves, it
//     remains in your graveyard.
//
// The intervening-if (rule 603.4, checked as it triggers and as it resolves): this card is in
// your graveyard and no other creature card is — fewer than two creature cards there, itself one.

const TEXT =
  "At the beginning of your upkeep, if this card is the only creature card in your graveyard, you may return this card to the battlefield.";

export default defineCard({
  name: "Nether Spirit",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      fromGraveyard: true,
      condition: {
        kind: "all",
        of: [
          { kind: "source-zone", zones: ["graveyard"], sameObject: true },
          { kind: "not", of: { kind: "cards-in-graveyard", atLeast: 2, filter: { type: "creature" } } },
        ],
      },
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Nether Spirit from your graveyard to the battlefield?",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
