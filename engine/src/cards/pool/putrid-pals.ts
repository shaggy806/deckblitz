import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 23906.
//
// Rulings:
//   [2026-01-27] Some disappear abilities, such as those of the above cards, are triggered
//     abilities with intervening if clauses. If a permanent hasn't left the battlefield under your
//     control that turn by the time the disappear ability would trigger, it won't trigger at all.
// An "enters with" replacement (rule 614.1c): the condition is read as it
// enters, and with none of it there it enters with no counters.

const ENTERS_TEXT =
  "Disappear — This creature enters with two +1/+1 counters on it if a permanent left the battlefield under your control this turn.";

export default defineCard({
  name: "Putrid Pals",
  manaCost: "{2}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Ooze", "Mutant"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: REVOLT_CONDITION, then: 2, else: 0 } },
      },
      text: ENTERS_TEXT,
    },
  ],
});
