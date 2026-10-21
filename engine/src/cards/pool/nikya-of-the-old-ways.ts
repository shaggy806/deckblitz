import { defineCard } from "../define.js";

// Ravnica Allegiance. The mana half is Mirari's Wake's triggered mana ability:
// one mana of a type the land produced, the player's pick when it made more
// than one, with none of the land's riders (the rulings).
const PROHIBIT_TEXT = "You can't cast noncreature spells.";
const MANA_TEXT = "Whenever you tap a land for mana, add one mana of any type that land produced.";

export default defineCard({
  name: "Nikya of the Old Ways",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Centaur", "Druid"],
  power: 5,
  toughness: 5,
  text: `${PROHIBIT_TEXT}\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "you", spells: { notTypes: ["creature"] } },
      text: PROHIBIT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-mana", mana: "produced", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
