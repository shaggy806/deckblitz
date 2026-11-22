import { defineCard } from "../define.js";
import { increment } from "../helpers.js";

// Secrets of Strixhaven (SOS). EDHREC rank 19785.

const INCREMENT = increment();
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may pay {X}. When you do, move X +1/+1 counters from this creature onto another target creature.";

export default defineCard({
  name: "Tester of the Tangential",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${INCREMENT.text}\n${COMBAT_TEXT}`,
  triggered: [
    INCREMENT,
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      // Rose Room Treasurer's shape: a `may` paying {X}, its reflexive
      // ability (rule 603.12) targeting as it triggers and reading that X; a
      // counter each move (122.5), so no more than this creature has.
      effect: {
        kind: "may",
        prompt: "Pay {X} to move X +1/+1 counters from Tester of the Tangential onto another target creature?",
        cost: "{X}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "other", of: "creature" }],
          effect: { kind: "move-counters", from: "source", to: 0, counter: "+1/+1", amount: { count: "x" } },
          text: "When you do, move X +1/+1 counters from this creature onto another target creature.",
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
