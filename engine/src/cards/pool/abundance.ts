import { defineCard } from "../define.js";

// EDHREC rank 1960.
//
// Each draw is asked about as it happens (the rulings): draw it, or choose
// land or nonland and reveal until one. The card is put into the hand, not
// drawn, so nothing that triggers on a draw does; it applies with an empty
// library too (rule 614.11). With nothing of the chosen kind, every card
// revealed goes to the bottom in the order the player picks.
const TEXT =
  "If you would draw a card, you may instead choose land or nonland and reveal cards from the top of your library until you reveal a card of the chosen kind. Put that card into your hand and put all other cards revealed this way on the bottom of your library in any order.";

export default defineCard({
  name: "Abundance",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
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
                effect: { kind: "reveal-until", filter: { type: "land" }, put: "hand", rest: "bottom-any-order" },
              },
              {
                text: "Nonland",
                effect: { kind: "reveal-until", filter: { notTypes: ["land"] }, put: "hand", rest: "bottom-any-order" },
              },
            ],
          },
        }, may: true,
      },
      text: TEXT,
    },
  ],
});
