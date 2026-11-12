import { defineCard } from "../define.js";

// EDHREC rank 12810. The Dwarves are counted as the ability resolves (the
// ruling).

const ATTACK_TEXT = "Whenever Dáin attacks, he deals damage equal to the number of Dwarves you control to each opponent.";

export default defineCard({
  name: "Dáin of the Ancient Halls",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Noble"],
  power: 4,
  toughness: 5,
  keywords: ["vigilance", "haste"],
  text: `Vigilance, haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "damage", who: "each-opponent", amount: { countOf: { subtype: "Dwarf", controlledBy: "you" } } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
