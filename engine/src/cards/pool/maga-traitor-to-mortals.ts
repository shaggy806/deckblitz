import { defineCard } from "../define.js";

// Saviors of Kamigawa. The counters are read as the trigger resolves — Maga's
// last-known counters if it has left (rule 608.2h).
const ENTER_TEXT = "When Maga enters, target player loses life equal to the number of +1/+1 counters on it.";

export default defineCard({
  name: "Maga, Traitor to Mortals",
  manaCost: "{X}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 0,
  text: `Maga enters with X +1/+1 counters on it.\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "Maga enters with X +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "lose-life", target: 0, amount: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
