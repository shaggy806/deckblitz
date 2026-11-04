import { ODD_OR_EVEN } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 15695.
//
// "That hasn't been chosen" is this Gollum's own memory, as Silent
// Hallcreeper's (one that leaves and returns starts afresh, rule 400.7). The
// mode is chosen as the trigger goes on the stack; with all three chosen no mode
// can be, and it's removed from the stack (rule 603.3c).

const ENTER_TEXT = "As Gollum enters, choose odd or even. (Zero is even.)";
const TRIGGER_TEXT = "Whenever an opponent casts a spell with mana value of the chosen quality, choose one that hasn't been chosen —";
const COUNTER_MODE = "Put a +1/+1 counter on Gollum.";
const DRAIN_MODE = "Each opponent loses 2 life and you gain 2 life.";
const DRAW_MODE = "Draw a card.";

export default defineCard({
  name: "Gollum, Riddle Master",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Halfling", "Horror"],
  power: 3,
  toughness: 1,
  text: `${ENTER_TEXT}\n${TRIGGER_TEXT}\n• ${COUNTER_MODE}\n• ${DRAIN_MODE}\n• ${DRAW_MODE}`,
  chooseOnEnter: ODD_OR_EVEN,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { manaValueParity: "chosen" } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: COUNTER_MODE, effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } },
          {
            text: DRAIN_MODE,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", who: "each-opponent", amount: 2 },
                { kind: "gain-life", amount: 2 },
              ],
            },
          },
          { text: DRAW_MODE, effect: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${COUNTER_MODE} ${DRAIN_MODE} ${DRAW_MODE}`,
    },
  ],
});
