import { defineCard } from "../define.js";

const TEXT = "Creatures of the chosen color without flying can't attack you.";

export default defineCard({
  name: "Teferi's Moat",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose a color.\n${TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", ofChosenColor: true, notKeyword: "flying" } },
      restrictions: [{ kind: "cant-attack", at: "you" }],
      text: TEXT,
    },
  ],
});
