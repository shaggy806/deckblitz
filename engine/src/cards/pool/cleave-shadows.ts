import { defineCard } from "../define.js";

export default defineCard({
  name: "Cleave Shadows",
  art: "https://cards.scryfall.io/art_crop/back/a/b/ab03c342-2bf4-41bf-8bb8-472d978d238a.jpg",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Creatures your opponents control get -1/-1 until end of turn. (Then exile this card. You may cast the creature later from exile.)",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "opponent" },
    power: -1,
    toughness: -1,
    duration: "end-of-turn",
  },
  faces: ["Shrouded Shepherd", "Cleave Shadows"],
  adventure: true,
});
