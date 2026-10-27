import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 26197.
//
// Rulings:
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//
// Shatterskull Charger's kicked enters-with-counter replacement.
export default defineCard({
  name: "Urborg Skeleton",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 0,
  toughness: 1,
  kicker: { cost: "{3}" },
  text: "Kicker {3} (You may pay an additional {3} as you cast this spell.)\n{B}: Regenerate this creature.\nIf this creature was kicked, it enters with a +1/+1 counter on it.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
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
