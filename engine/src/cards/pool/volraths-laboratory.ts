import { CHOSEN_COLOR_AND_TYPE_TOKEN } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 27874.
//
// Rulings:
//   The token does not have any built-in abilities. For example, choosing
//     creature type Bird does not give the token Flying.
//   The token has the same name as the creature type plus the word "Token."
//     For example, if the chosen creature type is Bird, the token's name is
//     "Bird Token."

const CHOOSE = "As this artifact enters, choose a color and a creature type.";
const MAKE = "{5}, {T}: Create a 2/2 creature token of the chosen color and type.";

export default defineCard({
  name: "Volrath's Laboratory",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `${CHOOSE}\n${MAKE}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  chooseCreatureTypeOnEnter: true,
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: CHOSEN_COLOR_AND_TYPE_TOKEN,
        count: 1,
        ofChosenColorAndType: true,
        basePt: { power: 2, toughness: 2 },
      },
      resolve: null,
      text: MAKE,
    },
  ],
});
