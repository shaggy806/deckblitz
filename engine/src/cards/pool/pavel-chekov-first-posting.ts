import { defineCard } from "../define.js";

// EDHREC rank 31382.
//
// Abundance's replacement, the rest in a random order: each draw asked about
// as it would happen — draw it, or choose land or nonland and reveal until
// one. The card is put into the hand, not drawn.
const TEXT =
  "If you would draw a card, you may instead choose land or nonland and reveal cards from the top of your library until you reveal a card of the chosen kind. Put that card into your hand and put all other cards revealed this way on the bottom of your library in a random order.";

export default defineCard({
  name: "Pavel Chekov, First Posting",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 1,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: {
          text: "choose land or nonland and reveal instead",
          effect: {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              {
                text: "Land",
                effect: { kind: "reveal-until", filter: { type: "land" }, put: "hand", rest: "bottom-random" },
              },
              {
                text: "Nonland",
                effect: { kind: "reveal-until", filter: { notTypes: ["land"] }, put: "hand", rest: "bottom-random" },
              },
            ],
          },
        }, may: true,
      },
      text: TEXT,
    },
  ],
});
