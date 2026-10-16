import { defineCard } from "../define.js";

// EDHREC rank 21881. The Lost Caverns of Ixalan.
//
// "While you control two or more artifacts" is part of the trigger condition
// (rule 603.1), checked only as it attacks: losing artifacts afterwards
// doesn't stop the bonus (the ruling) — `whileCondition`, not `condition`.

const TEXT =
  "Whenever this creature attacks while you control two or more artifacts, it gets +2/+1 until end of turn.";

export default defineCard({
  name: "Brazen Blademaster",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "artifact" }, atLeast: 2 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
