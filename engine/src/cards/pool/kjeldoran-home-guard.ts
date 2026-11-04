import { ATTACKED_OR_BLOCKED_THIS_COMBAT } from "../helpers.js";
import { defineCard } from "../define.js";

// An intervening if (rule 603.4), a record of the declaration: it holds for one
// removed from combat since, and for one gone by the time it resolves, read as
// it last was, when the Deserter still comes.
const TEXT =
  "At end of combat, if this creature attacked or blocked this combat, put a -0/-1 counter on this creature and create a 0/1 white Deserter creature token.";

export default defineCard({
  name: "Kjeldoran Home Guard",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      condition: ATTACKED_OR_BLOCKED_THIS_COMBAT,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "-0/-1", amount: 1 },
          { kind: "create-token", token: "Deserter Token", count: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
