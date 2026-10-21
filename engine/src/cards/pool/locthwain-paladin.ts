import { defineCard } from "../define.js";

// Adamant: an enters replacement (rule 614.1c) gated on the black mana spent
// to cast it, which the permanent keeps from the spell.
const ADAMANT =
  "Adamant — If at least three black mana was spent to cast this spell, this creature enters with a +1/+1 counter on it.";

export default defineCard({
  name: "Locthwain Paladin",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ADAMANT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { B: 3 } } },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ADAMANT,
    },
  ],
});
