import { defineCard } from "../define.js";

// EDHREC rank 15185.
//
// Act of Treason's shape over an artifact or creature. "If you do" is the
// counters actually put: a delayed ability `about` the permanents this put
// counters on (Satya's shape), so none is set up when it isn't a Spacecraft.
// It removes ten whatever else has happened to the count since (as many as
// there are — `remove-counter`), and nothing from a permanent that has left
// and come back (rule 400.7).

const TEXT =
  "Gain control of target artifact or creature until end of turn. Untap that permanent. It gains haste until end of turn. If it's a Spacecraft, put ten charge counters on it. If you do, remove ten charge counters from it at the beginning of the next end step.";

export default defineCard({
  name: "Systems Override",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["artifact-or-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Spacecraft" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "charge", amount: 10 },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              about: "counters-put",
              effect: { kind: "remove-counter", target: 0, counter: "charge", amount: 10 },
              text: "Remove ten charge counters from it.",
            },
          ],
        },
      },
    ],
  },
});
