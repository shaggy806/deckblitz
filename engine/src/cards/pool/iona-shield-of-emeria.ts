import { defineCard } from "../define.js";

const TEXT = "Your opponents can't cast spells of the chosen color.";

export default defineCard({
  name: "Iona, Shield of Emeria",
  manaCost: "{6}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  supertypes: ["legendary"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  text: `Flying\nAs Iona enters, choose a color.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "opponents", spells: { ofChosenColor: true } },
      text: TEXT,
    },
  ],
});
