import { defineCard } from "../define.js";

// EDHREC rank 19536.
//
// A resolved replacement for the turn (rules 611.2c, 614.6, 701.24a):
// `shuffleInstead`, judged as each creature would exist on the battlefield
// (614.12) — one entering from exile (a flicker's return, a card put there
// from exile) or a creature spell cast from exile resolving is shuffled into
// its owner's library instead of entering. Anything else enters as usual.
const TEXT =
  "Until end of turn, if one or more creatures would enter from exile or after being cast from exile, their owners shuffle them into their libraries instead.";

export default defineCard({
  name: "Don't Blink",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${TEXT}\nCycling {2}`,
  cycling: { cost: "{2}" },
  effect: {
    kind: "replacement-effect",
    duration: "end-of-turn",
    replacement: {
      event: "others-enter-battlefield",
      filter: { type: "creature", anyOf: [{ enteredFrom: "exile" }, { castFrom: "exile" }] },
      shuffleInstead: true,
    },
  },
});
