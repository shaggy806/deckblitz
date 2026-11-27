import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 26897.
//
// The kicker's {X} is paid as X symbols each of one colour, no two alike
// (`xSpendOnly: { colored: true, distinct: true }` — so X is at most 5); its
// X is the spell's, read as the creature enters (rule 107.3).

export default defineCard({
  name: "Emblazoned Golem",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 1,
  toughness: 2,
  kicker: { cost: "{X}" },
  xSpendOnly: { colored: true, distinct: true },
  text: "Kicker {X} (You may pay an additional {X} as you cast this spell.)\nSpend only colored mana on X. No more than one mana of each color may be spent this way.\nIf this creature was kicked, it enters with X +1/+1 counters on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: "x", else: 0 } },
      },
      text: "If this creature was kicked, it enters with X +1/+1 counters on it.",
    },
  ],
});
