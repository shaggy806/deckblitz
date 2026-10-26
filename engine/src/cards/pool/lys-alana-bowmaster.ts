import { defineCard } from "../define.js";

// Rulings:
//   [2020-11-10] An ability that triggers when a player casts a spell resolves before the spell
//     that caused it to trigger. It resolves even if that spell is countered.

const TRIGGER_TEXT =
  "Whenever you cast an Elf spell, you may have this creature deal 2 damage to target creature with flying.";

export default defineCard({
  name: "Lys Alana Bowmaster",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Elf" } },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", keyword: "flying" } }],
      effect: {
        kind: "may",
        prompt: "Have Lys Alana Bowmaster deal 2 damage to the target creature?",
        effect: { kind: "damage", target: 0, amount: 2 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
