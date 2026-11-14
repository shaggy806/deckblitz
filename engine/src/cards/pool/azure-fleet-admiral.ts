import { defineCard } from "../define.js";

// EDHREC rank 10422. "Creatures the monarch controls" is `controlledBy:
// "monarch"` (rule 725), read as blockers are declared: whoever is the
// monarch then, nobody's creatures while there is none — so once an
// opponent takes the crown, their creatures can't block it.

const ETB = "When this creature enters, you become the monarch.";
const EVASION = "This creature can't be blocked by creatures the monarch controls.";

export default defineCard({
  name: "Azure Fleet Admiral",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 3,
  text: `${ETB}\n${EVASION}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: ETB,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { type: "creature", controlledBy: "monarch" } }],
      text: EVASION,
    },
  ],
});
