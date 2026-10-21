import { defineCard } from "../define.js";

// Legends. EDHREC rank 11597.

const NO_ATTACK = "Non-Eye creatures you control can't attack.";
const EVASION = "This creature can't be blocked except by Walls.";

export default defineCard({
  name: "Evil Eye of Orms-by-Gore",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Eye"],
  power: 3,
  toughness: 6,
  text: `${NO_ATTACK}\n${EVASION}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", notSubtypes: ["Eye"] } },
      restrictions: ["cant-attack"],
      text: NO_ATTACK,
    },
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { notSubtypes: ["Wall"] },
      text: EVASION,
    },
  ],
});
