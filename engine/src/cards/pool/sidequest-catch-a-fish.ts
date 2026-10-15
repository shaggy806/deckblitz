import { defineCard } from "../define.js";

// EDHREC rank 8041.
// Makes Food → use "Food Token".
//
// Rulings:
//   [2025-06-06] You don't have to reveal the card even if it's an artifact or creature card. You
//     may choose not to reveal it and instead leave it on top of your library.
//
// Herald's Horn's look at the top card: an artifact or creature card may be
// revealed and taken (min 0), anything else stays. The look-and-choose's
// `then` runs only when a card was taken — "if you put a card into your hand
// this way" — and makes the Food, then transforms this into Cooking Campsite
// (Sidequest: Raise a Chocobo's `transform` of the source).

const UPKEEP_TEXT =
  "At the beginning of your upkeep, look at the top card of your library. If it's an artifact or creature card, you may reveal it and put it into your hand. If you put a card into your hand this way, create a Food token and transform this enchantment.";

export default defineCard({
  name: "Sidequest: Catch a Fish",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["artifact", "creature"] },
        destination: "hand",
        leftover: "stay",
        then: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Food Token", count: 1 },
            { kind: "transform", target: "source" },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Sidequest: Catch a Fish", "Cooking Campsite"],
  transform: true,
});
