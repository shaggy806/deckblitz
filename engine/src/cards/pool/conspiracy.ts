import { defineCard } from "../define.js";

// EDHREC rank 5474. "Are the chosen type", with no "in addition": their other
// creature types go (rule 205.1a).
const TEXT =
  "Creatures you control are the chosen type. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.";

export default defineCard({
  name: "Conspiracy",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: `As this enchantment enters, choose a creature type.\n${TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      setsChosenCreatureType: true,
      outsideBattlefield: { ofType: ["creature"], setsChosenCreatureType: true },
      text: TEXT,
    },
  ],
});
