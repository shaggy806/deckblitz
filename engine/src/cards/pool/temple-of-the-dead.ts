import { defineCard } from "../define.js";

export default defineCard({
  name: "Temple of the Dead",
  art: "https://cards.scryfall.io/art_crop/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg",
  colors: [],
  types: ["land"],
  text: "(Transforms from Aclazotz, Deepest Betrayal.)\n{T}: Add {B}.\n{2}{B}, {T}: Transform this land. Activate only if a player has one or fewer cards in hand and only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: "{2}{B}", tap: true },
      sorcerySpeed: true,
      condition: { kind: "not", of: { kind: "hand-size", who: "each-player", atLeast: 2 } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{2}{B}, {T}: Transform this land. Activate only if a player has one or fewer cards in hand and only as a sorcery.",
    },
  ],
  faces: ["Aclazotz, Deepest Betrayal", "Temple of the Dead"],
  transform: true,
});
