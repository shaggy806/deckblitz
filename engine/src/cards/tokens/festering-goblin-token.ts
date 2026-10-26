import { defineCard } from "../define.js";

const DIES = "When this token dies, target creature gets -1/-1 until end of turn.";

/** 1/1 black Zombie Goblin named Festering Goblin — Skirk Ridge Exhumer's token. */
export default defineCard({
  name: "Festering Goblin Token",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Goblin"],
  power: 1,
  toughness: 1,
  text: DIES,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: DIES,
    },
  ],
});
