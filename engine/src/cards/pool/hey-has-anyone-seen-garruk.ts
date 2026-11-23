import { defineCard } from "../define.js";

export default defineCard({
  name: "Hey, Has Anyone Seen Garruk?",
  art: "https://cards.scryfall.io/art_crop/back/1/7/17879408-2e40-4658-8dd3-dab6e98528aa.jpg",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Mill the top four cards of your library. Return a creature or planeswalker card milled this way to your hand.",
  faces: ["Garruk's Lost Wolf", "Hey, Has Anyone Seen Garruk?"],
  adventure: true,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 4 },
      // Not "you may": one is returned whenever one was milled.
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { thisWay: "milled", typesAnyOf: ["creature", "planeswalker"] },
      },
    ],
  },
});
