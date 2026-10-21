import { defineCard } from "../define.js";

export default defineCard({
  name: "Usher to Safety",
  art: "https://cards.scryfall.io/art_crop/back/c/0/c0b4f0ce-0d18-4546-803d-94a2f4f30951.jpg",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Return target permanent you control to its owner's hand. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "permanent", whose: "you", filter: {} }],
  effect: { kind: "return-to-hand", target: 0 },
  faces: ["Shepherd of the Flock", "Usher to Safety"],
  adventure: true,
});
