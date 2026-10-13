import { defineCard } from "../define.js";

// EDHREC rank 15754.
//
// "If it isn't that player's turn" is an intervening "if" on the cast
// (`offTurn` — rule 603.4): any player's spell cast on another player's
// turn, Vision's controller's included. The mode is chosen as the trigger is
// put on the stack (rule 700.2a). Phased out (rule 702.26b), Vision and
// what's attached to him phase in as his controller's next untap step
// begins.
const TRIGGER = "Whenever a player casts a spell, if it isn't that player's turn, choose one —";
const COUNTER = "Put a +1/+1 counter on Vision.";
const PHASE =
  "Vision phases out. (Treat him and anything attached to him as though they don't exist until your next turn.)";

export default defineCard({
  name: "Vision, Synthezoid Avenger",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER}\n• ${COUNTER}\n• ${PHASE}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", offTurn: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: COUNTER, effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } },
          { text: PHASE, effect: { kind: "phase-out", target: "source" } },
        ],
      },
      resolve: null,
      text: `${TRIGGER} ${COUNTER} ${PHASE}`,
    },
  ],
});
