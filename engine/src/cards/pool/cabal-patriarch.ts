import { defineCard } from "../define.js";

// EDHREC rank 27176.

const SAC_TEXT = "{2}{B}, Sacrifice a creature: Target creature gets -2/-2 until end of turn.";
const EXILE_TEXT = "{2}{B}, Exile a creature card from your graveyard: Target creature gets -2/-2 until end of turn.";

export default defineCard({
  name: "Cabal Patriarch",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 5,
  toughness: 5,
  text: `${SAC_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      cost: { mana: "{2}{B}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
