import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 5713.
//
// Rulings:
//   In non-Planechase games, Fractured Powerstone's second ability will have no effect.
//   Rolling the planar die this way doesn't count when determining the cost of the special action
//     of rolling the planar die.

// The planar die is the Planechase variant's (rule 901.3), and the engine
// plays no Planechase games: the ability can be activated — tapping the
// artifact, at sorcery speed — and does nothing as it resolves (rule 101.3,
// the first ruling).
const ROLL = "{T}: Roll the planar die. Activate only as a sorcery.";

export default defineCard({
  name: "Fractured Powerstone",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {C}.\n${ROLL}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "roll-dice", sides: "planar" },
      sorcerySpeed: true,
      resolve: null,
      text: ROLL,
    },
  ],
});
