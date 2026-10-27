import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31044.
//
// Rulings:
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//
// Shatterskull Charger's kicked enters-with-counter replacement.
export default defineCard({
  name: "Ardent Soldier",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  keywords: ["vigilance"],
  kicker: { cost: "{2}" },
  text: "Kicker {2} (You may pay an additional {2} as you cast this spell.)\nVigilance\nIf this creature was kicked, it enters with a +1/+1 counter on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 1, else: 0 } },
      },
      text: "If this creature was kicked, it enters with a +1/+1 counter on it.",
    },
  ],
});
