import { defineCard } from "../define.js";

export default defineCard({
  name: "Ringwarden Owl",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
  ],
});
