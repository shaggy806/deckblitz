import { defineCard } from "../define.js";

export default defineCard({
  name: "Monica Rambeau",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying, prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\n{2}{R}{W}{W}: Transform Monica Rambeau. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{2}{R}{W}{W}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{2}{R}{W}{W}: Transform Monica Rambeau. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
  ],
  faces: ["Monica Rambeau", "Photon, Living Light"],
});
