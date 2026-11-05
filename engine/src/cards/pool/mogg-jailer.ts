import { defineCard } from "../define.js";

// EDHREC rank 31870.

export default defineCard({
  name: "Mogg Jailer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: "This creature can't attack if defending player controls an untapped creature with power 2 or less.",
  static: [
    {
      affects: { scope: "self" },
      cantAttackIfDefender: { controls: { type: "creature", tapped: false, power: { op: "lte", n: 2 } } },
      text: "This creature can't attack if defending player controls an untapped creature with power 2 or less.",
    },
  ],
});
