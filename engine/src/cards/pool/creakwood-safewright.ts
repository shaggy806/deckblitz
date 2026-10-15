import { defineCard } from "../define.js";

// EDHREC rank 15867.

// Both halves of the intervening "if" (rule 603.4) are checked as the end
// step begins and again as it resolves.
const ENTERS_TEXT = "This creature enters with three -1/-1 counters on it.";
const END_TEXT =
  "At the beginning of your end step, if there is an Elf card in your graveyard and this creature has a -1/-1 counter on it, remove a -1/-1 counter from this creature.";

export default defineCard({
  name: "Creakwood Safewright",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 5,
  toughness: 5,
  text: `${ENTERS_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 3 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Elf" } },
          { kind: "self-counters", counter: "-1/-1", compare: { op: "gte", n: 1 } },
        ],
      },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
