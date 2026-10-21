import { defineCard } from "../define.js";

// Adamant on three mana of any one colour (`manaSpentOfOneColor`), as an
// enters replacement.
const ADAMANT =
  "Adamant — If at least three mana of the same color was spent to cast this spell, this creature enters with a +1/+1 counter on it.";

export default defineCard({
  name: "Henge Walker",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 2,
  text: ADAMANT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { manaSpentOfOneColor: 3 } },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ADAMANT,
    },
  ],
});
