import { defineCard } from "../define.js";

export default defineCard({
  name: "Cast Off",
  art: "https://cards.scryfall.io/art_crop/back/d/6/d6fc6ed9-740a-4726-8f2c-5d662636f687.jpg",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Destroy all non-Giant creatures. (Then exile this card. You may cast the creature later from exile.)",
  effect: { kind: "destroy-all", filter: { type: "creature", notSubtypes: ["Giant"] } },
  faces: ["Realm-Cloaked Giant", "Cast Off"],
  adventure: true,
});
