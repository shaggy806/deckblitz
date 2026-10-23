import { defineCard } from "../define.js";

const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const COST_TEXT = "Instant and sorcery spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Voracious Reader",
  art: "https://cards.scryfall.io/art_crop/back/2/2/22e816af-df55-4a3f-a6e7-0ff3bb1b45b5.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Homunculus"],
  power: 3,
  toughness: 4,
  text: `${PROWESS_TEXT}\n${COST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["instant", "sorcery"] }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  faces: ["Curious Homunculus", "Voracious Reader"],
  transform: true,
});
