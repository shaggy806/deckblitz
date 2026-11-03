import { defineCard } from "../define.js";

// Foundations Jumpstart.
//
// "Becomes the target of a spell or ability for the first time each turn": by anyone
// (`firstTimeEachTurnByAnyone`) — the first time this turn any spell or ability has targeted it
// (this battlefield stint), whether or not this ability triggered then.

const TRIGGER_TEXT =
  "Whenever this creature becomes the target of a spell or ability for the first time each turn, put a +1/+1 counter on it.";
const FLYING_TEXT = "As long as this creature has three or more +1/+1 counters on it, it has flying.";

export default defineCard({
  name: "Angelic Cub",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Angel"],
  power: 1,
  toughness: 1,
  text: `${TRIGGER_TEXT}\n${FLYING_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 3 } },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", firstTimeEachTurnByAnyone: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
