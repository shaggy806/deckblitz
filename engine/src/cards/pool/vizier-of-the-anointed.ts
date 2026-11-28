import { defineCard } from "../define.js";

// Hour of Devastation. "A creature card with eternalize or embalm" is
// `hasKeyword` over the abilities `embalmAbility` / `eternalizeAbility` mark
// (`ActivatedAbility.keywordAbility`); the draw is `activates-ability`'s
// `keywordAbility`, a granted embalm included. The search may find nothing
// (rule 701.19b), so `min: 0` inside the `may`.

const ETB =
  "When this creature enters, you may search your library for a creature card with eternalize or embalm, put that card into your graveyard, then shuffle.";
const DRAW = "Whenever you activate an eternalize or embalm ability, draw a card.";

export default defineCard({
  name: "Vizier of the Anointed",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 4,
  text: `${ETB}\n${DRAW}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a creature card with eternalize or embalm and put it into your graveyard?",
        effect: {
          kind: "search-library",
          filter: { type: "creature", anyOf: [{ hasKeyword: "eternalize" }, { hasKeyword: "embalm" }] },
          destination: "graveyard",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: ETB,
    },
    {
      trigger: { on: "activates-ability", who: "you", keywordAbility: ["eternalize", "embalm"] },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
});
