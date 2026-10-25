import { defineCard } from "../define.js";

const TEXT = "Inspired — Whenever this creature becomes untapped, it gets +2/+0 until end of turn.";

export default defineCard({
  name: "Kragma Butcher",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
