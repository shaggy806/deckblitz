import { defineCard } from "../define.js";

// EDHREC rank 13300. Ixalan.

export default defineCard({
  name: "Pounce",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control fights target creature you don't control. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1 },
});
