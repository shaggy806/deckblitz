import { defineCard } from "../define.js";

// EDHREC rank 9893.
// The first sentence is a delayed triggered ability for the rest of the turn
// (rule 603.7c): each creature that enters under your control this turn
// gets it. Learn as the pool's other Lessons-matter spells have it (Pop
// Quiz): a game here has nothing outside it, so the choice is to discard a
// card to draw one, or nothing (the ruling: both are optional).
const ENTER_TEXT =
  "Whenever a creature you control enters this turn, put a +1/+1 counter on it and it gains haste until end of turn.";
const LEARN_TEXT =
  "Learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)";

export default defineCard({
  name: "First Day of Class",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${ENTER_TEXT}\n${LEARN_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } } },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
            { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" },
          ],
        },
        text: ENTER_TEXT,
      },
      {
        kind: "may",
        prompt: "Learn: discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
    ],
  },
});
