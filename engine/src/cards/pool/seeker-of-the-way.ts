import { defineCard } from "../define.js";

export default defineCard({
  name: "Seeker of the Way",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhenever you cast a noncreature spell, this creature gains lifelink until end of turn.",
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
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a noncreature spell, this creature gains lifelink until end of turn.",
    },
  ],
});
