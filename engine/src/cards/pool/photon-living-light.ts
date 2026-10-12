import { defineCard } from "../define.js";

export default defineCard({
  name: "Photon, Living Light",
  art: "https://cards.scryfall.io/art_crop/back/3/f/3f995518-b12a-4623-9ab3-b79a5cef3cba.jpg",
  manaCost: "{2}{R}{W}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "hexproof"],
  text: "Flying, hexproof, prowess\nWhenever you cast a noncreature spell, put a +1/+1 counter on each other creature you control.",
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
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: "Whenever you cast a noncreature spell, put a +1/+1 counter on each other creature you control.",
    },
  ],
  faces: ["Monica Rambeau", "Photon, Living Light"],
});
