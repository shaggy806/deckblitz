import { defineCard } from "../define.js";

export default defineCard({
  name: "Harvest Fear",
  art: "https://cards.scryfall.io/art_crop/back/4/d/4dc774b4-3f70-4351-b1b8-8a0193cb3a50.jpg",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Target opponent discards two cards. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["opponent"],
  effect: { kind: "discard", target: 0, amount: 2 },
  faces: ["Reaper of Night", "Harvest Fear"],
  adventure: true,
});
