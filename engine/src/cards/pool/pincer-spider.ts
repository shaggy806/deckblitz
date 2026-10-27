import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28560.
//
// Rulings:
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
const TEXT = "If this creature was kicked, it enters with a +1/+1 counter on it.";

export default defineCard({
  name: "Pincer Spider",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  kicker: { cost: "{3}" },
  text: `Kicker {3} (You may pay an additional {3} as you cast this spell.)\nReach (This creature can block creatures with flying.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 1, else: 0 } },
      },
      text: TEXT,
    },
  ],
});
