import { defineCard } from "../define.js";

// Adamant: an enters replacement (rule 614.1c) gated on the red mana spent
// to cast it, which the permanent keeps from the spell.
const ADAMANT =
  "Adamant — If at least three red mana was spent to cast this spell, this creature enters with a +1/+1 counter on it.";

export default defineCard({
  name: "Embereth Paladin",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${ADAMANT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { R: 3 } } },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ADAMANT,
    },
  ],
});
