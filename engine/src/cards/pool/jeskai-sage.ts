import { defineCard } from "../define.js";

export default defineCard({
  name: "Jeskai Sage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 1,
  toughness: 1,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhen this creature dies, draw a card.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature dies, draw a card.",
    },
  ],
});
