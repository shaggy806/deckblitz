import { defineCard } from "../define.js";

// Ravnica Allegiance. Ruthless Predation's shape: both targets are required,
// the pump lands if only the first is still legal, and the fight needs both
// (the rulings).
export default defineCard({
  name: "Savage Smash",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Target creature you control gets +2/+2 until end of turn. It fights target creature you don't control. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
