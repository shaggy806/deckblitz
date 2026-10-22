import { defineCard } from "../define.js";

export default defineCard({
  name: "Thorned Moloch",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 2,
  toughness: 2,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nThis creature has first strike as long as it's attacking.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantKeywords: ["first-strike"],
      text: "This creature has first strike as long as it's attacking.",
    },
  ],
});
