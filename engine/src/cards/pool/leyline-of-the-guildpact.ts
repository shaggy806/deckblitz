import { defineCard } from "../define.js";

// EDHREC rank 1720. "Is all colors" sets the five colors in layer 5, so it
// replaces what a permanent had and timestamps order it against another such
// effect (rule 613.1e). Lands get every basic land type, keeping their other
// subtypes, and each type's mana ability with it (rule 305.7, the rulings); a
// land creature is a land, so it stays its colors.

const OPENING = "If this card is in your opening hand, you may begin the game with it on the battlefield.";
const ALL_COLORS = "Each nonland permanent you control is all colors.";
const LANDS = "Lands you control are every basic land type in addition to their other types.";

export default defineCard({
  name: "Leyline of the Guildpact",
  manaCost: "{G/W}{G/U}{B/G}{R/G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: `${OPENING}\n${ALL_COLORS}\n${LANDS}`,
  static: [
    {
      affects: { scope: "filter", filter: { notTypes: ["land"], controlledBy: "you" } },
      setColors: ["W", "U", "B", "R", "G"],
      text: ALL_COLORS,
    },
    {
      affects: { scope: "filter", filter: { type: "land", controlledBy: "you" } },
      addSubtypes: ["Plains", "Island", "Swamp", "Mountain", "Forest"],
      text: LANDS,
    },
  ],
});
