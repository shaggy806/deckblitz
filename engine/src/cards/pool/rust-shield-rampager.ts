import { defineCard } from "../define.js";
import { offspringTrigger } from "../helpers.js";

// EDHREC rank 13989. Offspring as Iridescent Vinelasher has it; the evasion
// is read as blockers are declared, so shrinking a blocker afterwards doesn't
// unblock it (the ruling).
export default defineCard({
  name: "Rust-Shield Rampager",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Raccoon", "Warrior"],
  power: 4,
  toughness: 4,
  text:
    "Offspring {2} (You may pay an additional {2} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\n" +
    "This creature can't be blocked by creatures with power 2 or less.",
  kicker: { cost: "{2}", keyword: "offspring" },
  triggered: [offspringTrigger()],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
