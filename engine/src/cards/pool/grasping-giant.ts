import { defineCard } from "../define.js";

// Once per blocker (the ruling). The Giant stays blocked; a Giant gone before
// the trigger resolves exiles nothing (rule 610.3c — `untilSourceLeaves`
// checks its source), and a token exiled never comes back.
const BLOCKED_TEXT =
  "Whenever this creature becomes blocked by a creature, exile that creature until this creature leaves the battlefield.";

export default defineCard({
  name: "Grasping Giant",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 7,
  keywords: ["vigilance"],
  text: `Vigilance\n${BLOCKED_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "exile", target: "trigger-object", untilSourceLeaves: true },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
});
