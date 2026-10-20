import { defineCard } from "../define.js";

// EDHREC rank 12957.
//
// "If this creature was kicked, it enters with four +1/+1 counters on it" is
// its own enters replacement asking `self-kicked` (Shalai's Acolyte's shape).

const ENTER_TEXT = "If this creature was kicked, it enters with four +1/+1 counters on it.";

export default defineCard({
  name: "Cragplate Baloth",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  keywords: ["hexproof", "haste"],
  text: `Kicker {2}{G}\nThis spell can't be countered.\nHexproof, haste\n${ENTER_TEXT}`,
  kicker: { cost: "{2}{G}" },
  cantBeCountered: true,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 4, else: 0 } },
      },
      text: ENTER_TEXT,
    },
  ],
});
