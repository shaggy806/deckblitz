import { defineCard } from "../define.js";

// EDHREC rank 14357.
//
// "If this creature was kicked, it enters with two +1/+1 counters on it" is
// its own enters replacement asking `self-kicked` (Shalai's Acolyte's shape).

const ENTER_TEXT = "If this creature was kicked, it enters with two +1/+1 counters on it.";

export default defineCard({
  name: "Ghastly Gloomhunter",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Bat"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "lifelink"],
  text: `Kicker {3}{B} (You may pay an additional {3}{B} as you cast this spell.)\nFlying, lifelink\n${ENTER_TEXT}`,
  kicker: { cost: "{3}{B}" },
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
