import { defineCard } from "../define.js";

export default defineCard({
  name: "Concerted Care",
  art: "https://cards.scryfall.io/art_crop/back/6/b/6b8e6435-7de4-41d5-bc7d-8e24c11897d0.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Target artifact or creature you control gains hexproof and indestructible until end of turn. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
  faces: ["Bofur, Reliable Guardian", "Concerted Care"],
  adventure: true,
});
