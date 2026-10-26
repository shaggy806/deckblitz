import { defineCard } from "../define.js";

const FACES = ["Turn // Burn", "Turn", "Burn"];

// The left half of Turn // Burn (see turn-burn.ts).
export default defineCard({
  name: "Turn",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target creature loses all abilities and becomes a red Weird with base power and toughness 0/1.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature"],
  effect: {
    kind: "animate",
    target: 0,
    power: 0,
    toughness: 1,
    addTypes: ["creature"],
    addSubtypes: [],
    setSubtypes: ["Weird"],
    setColors: ["R"],
    loseAbilities: true,
    duration: "end-of-turn",
  },
  faces: FACES,
  split: true,
});
