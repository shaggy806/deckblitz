import { defineCard } from "../define.js";

// EDHREC rank 31833.

const ATTACK_TEXT = "Whenever Kruge attacks, attacking Klingons you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Kruge, Genesis Seeker",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Officer"],
  power: 2,
  toughness: 2,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Klingon", attacking: true, controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
