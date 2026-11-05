import { defineCard } from "../define.js";

// EDHREC rank 25383.

export default defineCard({
  name: "Hammerhead Shark",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shark"],
  power: 2,
  toughness: 3,
  text: "This creature can't attack unless defending player controls an Island.",
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Island" } },
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});
