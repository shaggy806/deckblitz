import { defineCard } from "../define.js";

// EDHREC rank 10402. Lockjaw's "put a counter on him. When you do": the
// reflexive trigger follows only a counter actually put, so not once Red Hulk
// has left the battlefield. It targets, Black Panther's "any other target" —
// never Red Hulk — and counts his +1/+1 counters as it resolves (as he last
// existed, if he's gone by then).
const ENRAGE_TEXT =
  "Enrage — Whenever Red Hulk is dealt damage, put a +1/+1 counter on him. When you do, he deals damage equal to the number of +1/+1 counters on him to any other target.";
const WHEN_YOU_DO = "He deals damage equal to the number of +1/+1 counters on him to any other target.";

export default defineCard({
  name: "Red Hulk",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gamma", "Berserker", "Villain"],
  power: 6,
  toughness: 7,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${ENRAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            {
              kind: "reflexive-trigger",
              targets: [{ kind: "other", of: "any-target" }],
              effect: { kind: "damage", amount: { countersOn: "source", counter: "+1/+1" }, target: 0 },
              text: WHEN_YOU_DO,
            },
          ],
        },
      },
      resolve: null,
      text: ENRAGE_TEXT,
    },
  ],
});
