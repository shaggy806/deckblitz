import { defineCard } from "../define.js";

const MANA = "{T}: Add four mana of the chosen color. Spend this mana only to cast monocolored spells of that color.";
const DRAW = "{3}, {T}: Draw two cards. Spend only mana of the chosen color to activate this ability.";

// Throne of Eldraine (ELD). EDHREC rank 895.
export default defineCard({
  name: "Throne of Eldraine",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `As Throne of Eldraine enters, choose a color.\n${MANA}\n${DRAW}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "chosen",
        amount: 4,
        spendOnly: {
          spell: { multicolored: false },
          chosenColor: true,
          text: "Spend this mana only to cast monocolored spells of that color.",
        },
      },
      resolve: null,
      text: MANA,
    },
    {
      cost: { mana: "{3}", tap: true, spendOnlyChosenColor: true },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: DRAW,
    },
  ],
});
