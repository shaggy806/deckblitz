import { defineCard } from "../define.js";

// EDHREC rank 21525.
//
// Guidelight Optimizer's restriction in red: an artifact spell, or any
// activated ability of a source in any zone.

const MANA_TEXT = "{T}: Add {R}. Spend this mana only to cast an artifact spell or to activate an ability.";

export default defineCard({
  name: "Purple Dragon Punks",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 1,
        spendOnly: {
          spell: { type: "artifact" },
          abilityOf: {},
          abilityOfAnyZone: true,
          text: "Spend this mana only to cast an artifact spell or to activate an ability.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
