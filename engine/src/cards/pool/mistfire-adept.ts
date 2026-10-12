import { defineCard } from "../define.js";

export default defineCard({
  name: "Mistfire Adept",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 3,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhenever you cast a noncreature spell, target creature gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a noncreature spell, target creature gains flying until end of turn.",
    },
  ],
});
