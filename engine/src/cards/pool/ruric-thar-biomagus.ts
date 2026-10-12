import { defineCard } from "../define.js";

export default defineCard({
  name: "Ruric Thar, Biomagus",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ogre", "Crab", "Wizard"],
  power: 4,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nProwess, prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn twice.)\nWhenever Ruric Thar becomes the target of a spell or ability an opponent controls, draw a card.",
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
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever Ruric Thar becomes the target of a spell or ability an opponent controls, draw a card.",
    },
  ],
});
