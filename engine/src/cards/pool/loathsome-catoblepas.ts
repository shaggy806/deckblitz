import { defineCard } from "../define.js";

const LURE_TEXT = "{2}{G}: This creature must be blocked this turn if able.";
const DIES_TEXT = "When this creature dies, target creature an opponent controls gets -3/-3 until end of turn.";

export default defineCard({
  name: "Loathsome Catoblepas",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: `${LURE_TEXT}\n${DIES_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "restrict", target: "source", restrictions: ["must-be-blocked-if-able"] },
      resolve: null,
      text: LURE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
