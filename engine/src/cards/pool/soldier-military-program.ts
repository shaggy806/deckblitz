import { defineCard } from "../define.js";

// EDHREC rank 7030.
// Makes Soldier → use "Soldier Token".
//
// Rulings:
//   [2025-06-06] There's no extra bonus if you control more than one commander.
//   [2025-06-06] The commander you control doesn't have to be your commander.

const TRIGGER =
  "At the beginning of combat on your turn, choose one. If you control a commander, you may choose both instead.";
const TOKEN = "• Create a 1/1 white Soldier creature token.";
const COUNTERS = "• Put a +1/+1 counter on each of up to two Soldiers you control.";

export default defineCard({
  name: "SOLDIER Military Program",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${TRIGGER}\n${TOKEN}\n${COUNTERS}`,
  triggered: [
    {
      // A modal triggered ability: its modes are chosen as it goes on the
      // stack (rule 700.2b), so "if you control a commander" is read then —
      // any player's commander, one or two of them alike (the rulings).
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: {
          ifCondition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 },
          then: 2,
          else: 1,
        },
        modes: [
          { text: TOKEN, effect: { kind: "create-token", token: "Soldier Token", count: 1 } },
          {
            // Not targeted: chosen as it resolves, so a Soldier made by the
            // first mode can be one of them.
            text: COUNTERS,
            effect: {
              kind: "choose-permanents",
              filter: { subtype: "Soldier", controlledBy: "you" },
              upTo: 2,
              then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              prompt: "Put a +1/+1 counter on each of up to two Soldiers you control",
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
