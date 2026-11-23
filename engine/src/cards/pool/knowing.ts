import { defineCard } from "../define.js";

const FACES = ["Knowing // Half the Battle", "Knowing", "Half the Battle"];

// The left half of Knowing // Half the Battle (see knowing-half-the-battle.ts).
export default defineCard({
  name: "Knowing",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw three cards.",
  effect: { kind: "draw", amount: 3 },
  faces: FACES,
  split: true,
});
