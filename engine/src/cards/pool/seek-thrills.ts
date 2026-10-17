import { defineCard } from "../define.js";


export default defineCard({
  name: "Seek Thrills",
  art: "https://cards.scryfall.io/art_crop/back/3/f/3f5acc0d-33a6-476f-95ca-a1ad788334dd.jpg",
  manaCost: "{2}{G}{U}{R}",
  colors: ["U", "R", "G"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Mill seven cards. Then put all cards that have an Adventure from among the milled cards into your hand.",
  faces: ["Beluna Grandsquall", "Seek Thrills"],
  adventure: true,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 7 },
      { kind: "return-from-graveyard", filter: { thisWay: "milled", hasAdventure: true }, destination: "hand", count: "all" },
    ],
  },
});
