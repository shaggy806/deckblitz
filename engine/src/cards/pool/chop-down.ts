import { defineCard } from "../define.js";

export default defineCard({
  name: "Chop Down",
  art: "https://cards.scryfall.io/art_crop/back/7/5/75754468-2850-42e6-ab22-61ff7b9d1214.jpg",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Destroy target creature with power 4 or greater. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: { kind: "destroy", target: 0 },
  faces: ["Giant Killer", "Chop Down"],
  adventure: true,
});
