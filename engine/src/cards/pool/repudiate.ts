import { defineCard } from "../define.js";

const FACES = ["Repudiate // Replicate", "Repudiate", "Replicate"];

// The left half of Repudiate // Replicate (rule 709): Stifle's ability.
export default defineCard({
  name: "Repudiate",
  manaCost: "{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Counter target activated or triggered ability. (Mana abilities can't be targeted.)",
  targets: ["activated-or-triggered-ability"],
  effect: { kind: "counter", target: 0 },
  faces: FACES,
  split: true,
});
