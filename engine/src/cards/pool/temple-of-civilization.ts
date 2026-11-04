import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// The back face of Ojer Taq, Deepest Foundation.
const TRANSFORM_TEXT =
  "{2}{W}, {T}: Transform this land. Activate only if you attacked with three or more creatures this turn and only as a sorcery.";

export default defineCard({
  name: "Temple of Civilization",
  art: "https://cards.scryfall.io/art_crop/back/1/c/1ca79dd4-67fc-496c-96fc-489b039c4932.jpg",
  types: ["land"],
  text: `(Transforms from Ojer Taq, Deepest Foundation.)\n{T}: Add {W}.\n${TRANSFORM_TEXT}`,
  activated: [
    manaTapAbility("W"),
    {
      cost: { mana: "{2}{W}", tap: true },
      condition: { kind: "turn-stat", stat: "attackers", who: "you", atLeast: 3 },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Ojer Taq, Deepest Foundation", "Temple of Civilization"],
  transform: true,
});
