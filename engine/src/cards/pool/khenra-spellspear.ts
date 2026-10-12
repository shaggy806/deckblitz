import { defineCard } from "../define.js";

export default defineCard({
  name: "Khenra Spellspear",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Jackal", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\n{3}{U/P}: Transform this creature. Activate only as a sorcery. ({U/P} can be paid with either {U} or 2 life.)",
  activated: [
    {
      cost: { mana: "{3}{U/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{3}{U/P}: Transform this creature. Activate only as a sorcery.",
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
  faces: ["Khenra Spellspear", "Gitaxian Spellstalker"],
  transform: true,
});
