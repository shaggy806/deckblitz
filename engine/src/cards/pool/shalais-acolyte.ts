import { defineCard } from "../define.js";

// EDHREC rank 29186.
//
// "If this creature was kicked, it enters with two +1/+1 counters on it" is
// its own enters replacement (rule 614.1c) whose amount asks `self-kicked`
// (Viashino Branchrider's shape).

const ENTER_TEXT = "If this creature was kicked, it enters with two +1/+1 counters on it.";

export default defineCard({
  name: "Shalai's Acolyte",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Kicker {1}{G} (You may pay an additional {1}{G} as you cast this spell.)\nFlying\n${ENTER_TEXT}`,
  kicker: { cost: "{1}{G}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: ENTER_TEXT,
    },
  ],
});
