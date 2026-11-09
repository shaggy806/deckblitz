import { defineCard } from "../define.js";

// EDHREC rank 4000.
const TEXT =
  "Creatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.";

export default defineCard({
  name: "Arcane Adaptation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: `As this enchantment enters, choose a creature type.\n${TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      addsChosenCreatureType: true,
      outsideBattlefield: { ofType: ["creature"], addsChosenCreatureType: true },
      text: TEXT,
    },
  ],
});
