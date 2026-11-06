import { defineCard } from "../define.js";

// EDHREC rank 32092.

const ATTACK_TEXT =
  "Strange new worlds — Whenever this creature attacks, creatures you control get +X/+0 until end of turn, where X is the number of differently named lands you control.";

export default defineCard({
  name: "Pah-Wraith",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wraith"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike", "haste"],
  text: `First strike, haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
