import { defineCard } from "../define.js";

// Adamant: an enters replacement (rule 614.1c) gated on the white mana spent
// to cast it, which the permanent keeps from the spell.
const ADAMANT =
  "Adamant — If at least three white mana was spent to cast this spell, this creature enters with a +1/+1 counter on it.";

export default defineCard({
  name: "Ardenvale Paladin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 5,
  text: ADAMANT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { W: 3 } } },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ADAMANT,
    },
  ],
});
