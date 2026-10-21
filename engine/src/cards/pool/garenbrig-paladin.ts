import { defineCard } from "../define.js";

// Adamant: an enters replacement (rule 614.1c) gated on the green mana spent
// to cast it, which the permanent keeps from the spell.
const ADAMANT =
  "Adamant — If at least three green mana was spent to cast this spell, this creature enters with a +1/+1 counter on it.";
const EVASION = "This creature can't be blocked by creatures with power 2 or less.";

export default defineCard({
  name: "Garenbrig Paladin",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant", "Knight"],
  power: 4,
  toughness: 4,
  text: `${ADAMANT}\n${EVASION}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { G: 3 } } },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ADAMANT,
    },
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: EVASION,
    },
  ],
});
