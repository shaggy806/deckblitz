import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 30700.
const KICKED_TEXT = "If this creature was kicked, it enters with a +1/+1 counter on it.";

export default defineCard({
  name: "Kavu Aggressor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 3,
  toughness: 2,
  kicker: { cost: "{4}" },
  text: `Kicker {4} (You may pay an additional {4} as you cast this spell.)\nThis creature can't block.\n${KICKED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 1, else: 0 } },
      },
      text: KICKED_TEXT,
    },
  ],
});
