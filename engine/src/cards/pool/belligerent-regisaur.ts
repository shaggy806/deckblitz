import { defineCard } from "../define.js";

const CAST_TEXT = "Whenever you cast a spell, this creature gains indestructible until end of turn.";

export default defineCard({
  name: "Belligerent Regisaur",
  art: "https://cards.scryfall.io/art_crop/back/f/a/fa20fc16-e106-4953-ace4-5ac9c7fec97b.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  faces: ["Invasion of Ixalan", "Belligerent Regisaur"],
  transform: true,
});
