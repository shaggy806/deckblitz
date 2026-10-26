import { defineCard } from "../define.js";

// EDHREC rank 24716.

const TEXT = "Whenever you cast a multicolored spell, this creature gets +3/+3 until end of turn.";

export default defineCard({
  name: "Gloryscale Viashino",
  manaCost: "{1}{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["creature"],
  subtypes: ["Lizard", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
