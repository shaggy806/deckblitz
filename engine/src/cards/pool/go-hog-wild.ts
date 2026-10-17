import { defineCard } from "../define.js";

export default defineCard({
  name: "Go Hog Wild",
  art: "https://cards.scryfall.io/art_crop/back/4/2/4224747e-1dbc-4a29-b5da-5916d8ca2768.jpg",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Target creature gets +2/+2 until end of turn. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  faces: ["Intrepid Trufflesnout", "Go Hog Wild"],
  adventure: true,
});
