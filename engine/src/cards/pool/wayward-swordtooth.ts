import { defineCard } from "../define.js";

// Top-5000 #1046.

export default defineCard({
  name: "Wayward Swordtooth",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nYou may play an additional land on each of your turns.\nThis creature can't attack or block unless you have the city's blessing.",
  static: [
    {
      affects: { scope: "self" },
      extraLandsPerTurn: 1,
      text: "You may play an additional land on each of your turns.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "citys-blessing" } },
      restrictions: ["cant-attack", "cant-block"],
      text: "This creature can't attack or block unless you have the city's blessing.",
    },
  ],
});
