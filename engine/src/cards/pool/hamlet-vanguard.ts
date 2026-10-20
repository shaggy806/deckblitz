import { defineCard } from "../define.js";

// The count is read as it enters, never counting itself or anything entering with it
// (`enteringCounterAmount`, as Luxknight Breacher).

const ENTER_TEXT =
  "This creature enters with two +1/+1 counters on it for each other nontoken Human you control.";

export default defineCard({
  name: "Hamlet Vanguard",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: `Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { countOf: { subtype: "Human", token: false, controlledBy: "you" }, times: 2 },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});
