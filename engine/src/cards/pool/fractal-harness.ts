import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 6384. Counters and the Equipment go on before state-based actions
// see a 0/0, the sequence being one instruction (rule 704.3).
const ENTER_TEXT =
  "When this Equipment enters, create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it and attach this Equipment to it.";
const ATTACK_TEXT = "Whenever equipped creature attacks, double the number of +1/+1 counters on it.";

export default defineCard({
  name: "Fractal Harness",
  manaCost: "{X}{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Fractal Token", count: 1 },
          { kind: "add-counter", target: "created", counter: "+1/+1", amount: "x" },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "double-counters", target: "attached", counter: "+1/+1" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
