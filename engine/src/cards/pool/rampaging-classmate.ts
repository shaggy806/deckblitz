import { defineCard } from "../define.js";

// EDHREC rank 25278. Aurochs' count, over every other attacking creature.
const ATTACKS = "Whenever this creature attacks, it gets +1/+0 until end of turn for each other attacking creature.";

export default defineCard({
  name: "Rampaging Classmate",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Berserker"],
  power: 3,
  toughness: 2,
  text: ATTACKS,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "creature", attacking: true }, excludeSelf: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
