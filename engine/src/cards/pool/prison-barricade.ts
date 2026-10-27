import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29759. Kicked, it keeps "can attack as though it
// didn't have defender" until it leaves the battlefield (the ruling) — read
// from its having been kicked, not from the counter (as Kavu Titan's trample).
const TEXT =
  "If this creature was kicked, it enters with a +1/+1 counter on it and with \"This creature can attack as though it didn't have defender.\"";

export default defineCard({
  name: "Prison Barricade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 1,
  toughness: 3,
  keywords: ["defender"],
  kicker: { cost: "{1}{W}" },
  text: `Defender (This creature can't attack.)\nKicker {1}{W} (You may pay an additional {1}{W} as you cast this spell.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 1, else: 0 } },
      },
      text: TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-kicked" },
      canAttackAsThoughNoDefender: true,
      text: TEXT,
    },
  ],
});
