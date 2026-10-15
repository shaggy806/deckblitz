import { defineCard } from "../define.js";


export default defineCard({
  name: "Gaze in Wonder",
  art: "https://cards.scryfall.io/art_crop/back/5/c/5cc0f994-5048-4898-926e-b56cbc97e0ca.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Tap one or two target creatures. (Then exile this card. You may cast the creature later from exile.)",
  faces: ["Velvetwing Butterflies", "Gaze in Wonder"],
  adventure: true,
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
    ],
  },
});
