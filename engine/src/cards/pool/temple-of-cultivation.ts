import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// The back face of Ojer Kaslem, Deepest Growth.

export default defineCard({
  name: "Temple of Cultivation",
  art: "https://cards.scryfall.io/art_crop/back/0/c/0cbc43a3-8cba-4988-9de1-c89aedd79ada.jpg",
  colors: [],
  types: ["land"],
  text: "(Transforms from Ojer Kaslem, Deepest Growth.)\n{T}: Add {G}.\n{2}{G}, {T}: Transform this land. Activate only if you control ten or more permanents and only as a sorcery.",
  activated: [
    manaTapAbility("G"),
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      condition: { kind: "controls", filter: {}, atLeast: 10 },
      sorcerySpeed: true,
      text: "{2}{G}, {T}: Transform this land. Activate only if you control ten or more permanents and only as a sorcery.",
    },
  ],
  faces: ["Ojer Kaslem, Deepest Growth", "Temple of Cultivation"],
  transform: true,
});
