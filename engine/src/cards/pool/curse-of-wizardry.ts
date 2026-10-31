import { defineCard } from "../define.js";

// EDHREC rank 19980.
//
// Rulings:
//   [2010-06-15] Curse of Wizardry affects all players, including you.
//   [2010-06-15] If a player casts a spell of the chosen color, Curse of Wizardry’s second ability
//     triggers and goes on the stack on top of it. The ability will resolve before the spell does.
//
// "A spell of the chosen color": the trigger's filter reads the colour chosen
// as it entered (`ofChosenColor`) — none chosen, nothing triggers it, and a
// colorless spell never does.

const CHOOSE = "As this enchantment enters, choose a color.";
const LOSE = "Whenever a player casts a spell of the chosen color, that player loses 1 life.";

export default defineCard({
  name: "Curse of Wizardry",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${CHOOSE}\n${LOSE}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { ofChosenColor: true } },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-controller", amount: 1 },
      resolve: null,
      text: LOSE,
    },
  ],
});
