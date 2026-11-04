import { defineCard } from "../define.js";

export default defineCard({
  name: "Demonic Stench",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Each creature that blocked this turn gets -1/-1 until end of turn. (Then exile this card. You may cast the creature later from exile.)",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", blockedThisTurn: { relation: "blocked" } },
    power: -1,
    toughness: -1,
    duration: "end-of-turn",
  },
  faces: ["Hezrou", "Demonic Stench"],
  adventure: true,
});
