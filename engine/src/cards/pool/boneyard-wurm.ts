import { defineCard } from "../define.js";

// EDHREC rank 14215. Bloodsworn Knight's characteristic-defining ability.

const PT_TEXT =
  "Boneyard Wurm's power and toughness are each equal to the number of creature cards in your graveyard.";

export default defineCard({
  name: "Boneyard Wurm",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
