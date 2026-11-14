import { defineCard } from "../define.js";

// EDHREC rank 16149.
const ATTACK_TEXT = "Whenever Iroh attacks, attacking creatures get +1/+1 until end of turn.";

export default defineCard({
  name: "Iroh, Firebending Instructor",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Ally"],
  power: 2,
  toughness: 2,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
