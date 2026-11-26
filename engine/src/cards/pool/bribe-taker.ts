import { defineCard } from "../define.js";
import { CHOSEN_COUNTER } from "../../effects.js";

// EDHREC rank 20944. Streets of New Capenna Commander.
//
// `for-each-counter-kind` over the permanents you control: the kinds are
// read once as the ability resolves, and for each the "you may … your choice
// of" is one `modal` of up to one mode (none chosen is the "may" declined).
// With +1/+1 among the kinds, its two modes are the same counter.
//
// Rulings:
//   [2022-04-29] Bribe Taker counts the number of different kinds of counters on permanents, not
//     the total number of counters. For example, if a creature has two shield counters on it as
//     Bribe Taker's triggered ability resolves, Bribe Taker's controller may put only one counter
//     on it, either a +1/+1 counter or a shield counter.

const ENTERS_TEXT =
  "When this creature enters, for each kind of counter on permanents you control, you may put your " +
  "choice of a +1/+1 counter or a counter of that kind on this creature.";

export default defineCard({
  name: "Bribe Taker",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino", "Warrior"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-counter-kind",
        among: { controlledBy: "you" },
        effect: {
          kind: "modal",
          minModes: 0,
          maxModes: 1,
          modes: [
            { text: "A +1/+1 counter", effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } },
            {
              text: `A ${CHOSEN_COUNTER} counter`,
              effect: { kind: "add-counter", target: "source", counter: CHOSEN_COUNTER, amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
