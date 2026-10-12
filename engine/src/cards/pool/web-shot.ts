import { defineCard } from "../define.js";

export default defineCard({
  name: "Web Shot",
  art: "https://cards.scryfall.io/art_crop/back/8/f/8f5228dc-ec9d-456f-a89c-1bc592a1bbab.jpg",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Destroy target creature with flying. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "destroy", target: 0 },
  faces: ["Ettercap", "Web Shot"],
  adventure: true,
});
