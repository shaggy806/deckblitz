import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 29886.
//
// Rulings:
//   [2004-10-04] Remember that lands are not spells.
//
// "Nonred" is any spell without red among its colours, colourless ones included.
const UNTAP = "Whenever you cast a nonred spell, untap this creature.";

export default defineCard({
  name: "Dwarven Patrol",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 4,
  toughness: 2,
  text: `This creature doesn't untap during your untap step.\n${UNTAP}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { notColors: ["R"] } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This creature doesn't untap during your untap step.",
    },
  ],
});
