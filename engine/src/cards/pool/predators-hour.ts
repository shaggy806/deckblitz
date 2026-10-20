import { defineCard } from "../define.js";

// EDHREC rank 7677.
//
// Rulings:
//   [2022-02-18] You must pay all costs to play cards exiled this way, and you must follow all
//     normal timing permissions and restrictions. For example, if you play a land this way, you
//     may do so only during your main phase while the stack is empty and only if you haven't yet
//     played a land (unless another effect allows you to play additional lands).
//
// The granted trigger is Edward Kenway's face-down impulse from the damaged
// player's library ("that player" is `trigger-player`) with Cunning Rhetoric's
// "for as long as it remains exiled" and spend-as-any-color. Matches are
// fixed as the spell resolves (rule 611.2c): a creature that comes under your
// control later this turn gains neither.
const GRANTED_TEXT =
  "Whenever this creature deals combat damage to a player, exile the top card of that player's library face down. You may look at and play that card for as long as it remains exiled, and you may spend mana as though it were mana of any color to cast that spell.";

export default defineCard({
  name: "Predators' Hour",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Until end of turn, creatures you control gain menace and "${GRANTED_TEXT}"`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "menace",
        duration: "end-of-turn",
      },
      {
        kind: "grant-triggered-all",
        filter: { type: "creature", controlledBy: "you" },
        ability: {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: {
            kind: "impulse-exile",
            amount: 1,
            whose: "trigger-player",
            duration: "while-exiled",
            faceDown: true,
            spendAs: "any-color",
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
        duration: "end-of-turn",
      },
    ],
  },
});
