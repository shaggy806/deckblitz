import { defineCard } from "../define.js";

// EDHREC rank 10768.

const ENTERS_TEXT =
  "When this creature enters, put a shield counter on target noncommander creature you don't control. You gain control of that creature for as long as it has a shield counter on it. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)";

export default defineCard({
  name: "Shield Broker",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Advisor"],
  power: 3,
  toughness: 4,
  text: ENTERS_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", isCommander: false } }],
      // The control lasts while the counter does: the last one coming off
      // (damage, a destroy, anything that removes it) hands it back, for
      // good (rule 611.2b). No counter on it as the control would begin —
      // one that couldn't be put there — and it never changes hands.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "shield", amount: 1 },
          {
            kind: "gain-control",
            target: 0,
            untilEndOfTurn: false,
            whileIt: { counters: { kind: "shield", compare: { op: "gte", n: 1 } } },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
