import { defineCard } from "../define.js";

// Secret Arcade // Dusty Parlor's right door. A mana value with X chosen on the
// stack (the ruling).
const TEXT = "Whenever you cast an enchantment spell, put a number of +1/+1 counters equal to that spell's mana value on up to one target creature.";

export default defineCard({
  name: "Dusty Parlor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${TEXT}\n(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "enchantment" } },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { manaValueOf: "trigger-object" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
