import { defineCard } from "../define.js";

// Urza's Legacy (ULG). EDHREC rank 18158. Werewolf of Ancient Hunger's
// characteristic-defining ability.

const PT_TEXT =
  "Multani's power and toughness are each equal to the total number of cards in all players' hands.";

export default defineCard({
  name: "Multani, Maro-Sorcerer",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Sorcerer"],
  power: 0,
  toughness: 0,
  keywords: ["shroud"],
  text: `Shroud (This creature can't be the target of spells or abilities.)\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-all-hands", plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
});
