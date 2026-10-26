import { defineCard } from "../define.js";

// EDHREC rank 18483. Morningtide.
//
// Rulings:
//   [2008-04-01] The last ability puts a token creature onto the battlefield for each counter of
//     any kind that was on Kinsbaile Borderguard when it left the battlefield, not just for each
//     +1/+1 counter that was on it.
//
// Squad Captain's entry replacement over other Kithkin (any Kithkin permanent);
// the dies trigger counts every kind of counter (`countersOn` with no `counter`
// — the ruling), read from its last-known state.
const ENTER_TEXT = "This creature enters with a +1/+1 counter on it for each other Kithkin you control.";
const DIES_TEXT = "When this creature dies, create a 1/1 white Kithkin Soldier creature token for each counter on it.";

export default defineCard({
  name: "Kinsbaile Borderguard",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { countOf: { subtype: "Kithkin", controlledBy: "you" }, excludeSelf: true },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Soldier Token", count: { countersOn: "source" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
