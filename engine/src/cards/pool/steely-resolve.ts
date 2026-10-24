import { defineCard } from "../define.js";

const SHROUD_TEXT = "Creatures of the chosen type have shroud. (They can't be the targets of spells or abilities.)";

export default defineCard({
  name: "Steely Resolve",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: `As this enchantment enters, choose a creature type.\n${SHROUD_TEXT}`,
  static: [
    {
      // Every creature of the type, whoever controls it.
      affects: { scope: "filter", filter: { type: "creature", ofChosenType: true } },
      grantKeywords: ["shroud"],
      text: SHROUD_TEXT,
    },
  ],
});
