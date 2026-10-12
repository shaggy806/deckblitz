import { defineCard } from "../define.js";

export default defineCard({
  name: "Gitaxian Spellstalker",
  art: "https://cards.scryfall.io/art_crop/back/d/c/dc1454ce-bb49-4b4f-bbca-d77387fa4966.jpg",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Jackal"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample, ward {2}, prowess, prowess (Each instance of prowess triggers separately.)",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
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
  ],
  faces: ["Khenra Spellspear", "Gitaxian Spellstalker"],
  transform: true,
});
