import { defineCard } from "../define.js";

// Kaldheim. The back face of Egon, God of Death (a modal DFC).

const MILL_TEXT = "At the beginning of your upkeep, mill a card.";
const DRAW_TEXT = "{2}{B}, {T}, Exile a creature card from your graveyard: Draw a card.";

export default defineCard({
  name: "Throne of Death",
  art: "https://cards.scryfall.io/art_crop/back/9/d/9dfdb73d-b001-4a59-b79e-8c8c1baea116.jpg",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${MILL_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  faces: ["Egon, God of Death", "Throne of Death"],
});
