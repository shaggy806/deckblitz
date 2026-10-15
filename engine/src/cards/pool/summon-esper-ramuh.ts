import { defineCard } from "../define.js";

// EDHREC rank 10121. A Saga creature (Summon: Ixion's shape).
//
// Rulings:
//   [2025-06-06] Use the number of noncreature, nonland cards in your graveyard as Summon:
//     Esper Ramuh's first chapter ability resolves to determine how much damage is dealt.
const CHAPTER_I =
  "I — Judgment Bolt — This creature deals damage equal to the number of noncreature, nonland cards in your graveyard to target creature an opponent controls.";
const CHAPTER_II_III = "II, III — Wizards you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Summon: Esper Ramuh",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Wizard"],
  power: 3,
  toughness: 3,
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II_III}`,
  chapters: [
    {
      at: [1],
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "damage",
        target: 0,
        amount: { countInGraveyard: { notTypes: ["creature", "land"], ownedBy: "you" } },
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Wizard", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: CHAPTER_II_III,
    },
  ],
});
