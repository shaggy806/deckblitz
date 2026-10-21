import { defineCard } from "../define.js";

// Adamant: an enters replacement (rule 614.1c) gated on the blue mana spent
// to cast it, which the permanent keeps from the spell.
const ADAMANT =
  "Adamant — If at least three blue mana was spent to cast this spell, this creature enters with a +1/+1 counter on it.";

export default defineCard({
  name: "Vantress Paladin",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ADAMANT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { U: 3 } } },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ADAMANT,
    },
  ],
});
