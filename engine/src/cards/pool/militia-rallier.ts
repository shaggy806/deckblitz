import { defineCard } from "../define.js";

// EDHREC rank 26534.

export default defineCard({
  name: "Militia Rallier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: "This creature can't attack alone.\nWhenever this creature attacks, untap target creature.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "Whenever this creature attacks, untap target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone"],
      text: "This creature can't attack alone.",
    },
  ],
});
