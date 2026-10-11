import { defineCard } from "../define.js";

// EDHREC rank 18614. Reality Fracture.
//
// "If you do" (rule 608.2c): a counter has to come off for the others to get
// theirs, so the offer is made only while this is still the same object on
// the battlefield with a +1/+1 counter on it — then the removal can't fail.
// The removal happens before state-based actions, so a 1/0 that loses its
// last counter still sees "each other creature you control" get one, and
// isn't among them.

const ENTERS_TEXT = "This creature enters with X +1/+1 counters on it.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may remove a +1/+1 counter from this creature. " +
  "If you do, put a +1/+1 counter on each other creature you control.";

export default defineCard({
  name: "Guiding Hydra",
  manaCost: "{X}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Hydra", "Horror"],
  power: 1,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${COMBAT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Remove a +1/+1 counter from Guiding Hydra to put a +1/+1 counter on each other creature you control?",
          effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
          then: {
            kind: "add-counter-all",
            filter: { type: "creature", controlledBy: "you" },
            counter: "+1/+1",
            amount: 1,
            exceptSource: true,
          },
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
