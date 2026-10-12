import { defineCard } from "../define.js";

export default defineCard({
  name: "Spellrune Painter",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman", "Werewolf"],
  power: 2,
  toughness: 3,
  keywords: ["daybound"],
  text: "Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn.",
    },
  ],
  faces: ["Spellrune Painter", "Spellrune Howler"],
  transform: true,
});
