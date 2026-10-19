import { defineCard } from "../define.js";

// Moonshae Pixie's Adventure (`moonshae-pixie.ts`).

export default defineCard({
  name: "Pixie Dust",
  art: "https://cards.scryfall.io/art_crop/back/6/3/63780e4a-3f63-473c-97d0-5d9462e264f2.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Up to three target creatures gain flying until end of turn. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "any-number", of: "creature", max: 3 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
  },
  faces: ["Moonshae Pixie", "Pixie Dust"],
  adventure: true,
});
