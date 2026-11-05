import { defineCard } from "../define.js";

// The back face of Ore-Rich Stalactite. "An exiled card used to craft this
// artifact" is a card in exile linked to it by the craft cost (rule
// 702.167c), picked at random as the ability resolves; casting it is the
// controller's choice then and there, timing ignored (`cast-now`, free).
const TEXT =
  "{1}{R}, {T}: Choose an exiled card used to craft this artifact at random. You may cast that card without paying its mana cost.";

export default defineCard({
  name: "Cosmium Catalyst",
  art: "https://cards.scryfall.io/art_crop/back/c/5/c5f2f5e5-e408-4db1-87c3-b667f21ad509.jpg",
  colors: ["R"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "exiled-with-source",
        then: { kind: "cast-now", target: 0, free: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Ore-Rich Stalactite", "Cosmium Catalyst"],
  transform: true,
});
