import { defineCard } from "../define.js";

// EDHREC rank 24727. Amonkhet. "Remove a -1/-1 counter from it. If you do":
// only while Exemplar is still on the battlefield with one to remove (the
// ruling — gone, no counter is removed and no life gained).

const ENTER_TEXT = "When this creature enters, put three -1/-1 counters on target creature you control.";
const ATTACK_TEXT = "Whenever this creature attacks, remove a -1/-1 counter from it. If you do, you gain 1 life.";

export default defineCard({
  name: "Exemplar of Strength",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "-1/-1", compare: { op: "gte", n: 1 } },
          ],
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
            { kind: "gain-life", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
