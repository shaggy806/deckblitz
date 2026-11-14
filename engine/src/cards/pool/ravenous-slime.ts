import { defineCard } from "../define.js";

// EDHREC rank 10492.
//
// Rulings:
//   If more than one replacement effect tries to change where a dying creature ends up, that
//     creature's controller chooses which effect applies (rule 616.1): the other Slime's
//     counters are given up with its exile (`then`).
//   The exiled creature's last known existence on the battlefield is checked to determine its
//     power (rule 608.2h — `"trigger-object"` in a replacement's `then`).
//   A token can die and be exiled this way too.
//   If Ravenous Slime dies at the same time as an opponent's creatures, the opponent's
//     creatures are exiled (the leave batch) and the Slime gets no counters.
//
// The exile and the counters are both the replacement (rule 614.1a): nothing goes on the stack.
const EVASION_TEXT = "This creature can't be blocked by creatures with power 2 or less.";
const REPLACE_TEXT =
  "If a creature an opponent controls would die, instead exile it and put a number of +1/+1 counters equal to that creature's power on this creature.";

export default defineCard({
  name: "Ravenous Slime",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 1,
  toughness: 1,
  text: `${EVASION_TEXT}\n${REPLACE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "lte", n: 2 } } }],
      text: EVASION_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", controlledBy: "opponent" },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { powerOf: "trigger-object" } },
      },
      text: REPLACE_TEXT,
    },
  ],
});
