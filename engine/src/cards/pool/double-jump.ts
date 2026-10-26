import { defineCard } from "../define.js";

const FACES = ["Double Jump // Flying Kick", "Double Jump", "Flying Kick"];

// The left half of Double Jump // Flying Kick (see double-jump-flying-kick.ts).
export default defineCard({
  name: "Double Jump",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put a flying counter on target creature you control. Until end of turn, it has base power and toughness 5/5.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
      {
        kind: "animate",
        target: 0,
        power: 5,
        toughness: 5,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
    ],
  },
  faces: FACES,
  split: true,
});
