import { defineCard } from "../define.js";

export default defineCard({
  name: "Spellrune Howler",
  art: "https://cards.scryfall.io/art_crop/back/d/2/d2a5b43d-e21b-4294-9ea2-5bd0264e71d3.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 4,
  keywords: ["nightbound"],
  text: "Whenever you cast an instant or sorcery spell, this creature gets +2/+2 until end of turn.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, this creature gets +2/+2 until end of turn.",
    },
  ],
  faces: ["Spellrune Painter", "Spellrune Howler"],
  transform: true,
});
