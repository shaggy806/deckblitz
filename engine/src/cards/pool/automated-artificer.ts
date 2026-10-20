import { defineCard } from "../define.js";

// Rulings:
//   [2022-02-18] Mana from Automated Artificer's ability can be spent to activate any ability,
//     including those activated from off the battlefield, such as ninjutsu or channel abilities.
//     (`abilityOfAnyZone`.)

const MANA_TEXT = "{T}: Add {C}. Spend this mana only to activate an ability or cast an artifact spell.";

export default defineCard({
  name: "Automated Artificer",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Artificer"],
  power: 1,
  toughness: 3,
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spendOnly: {
          spell: { type: "artifact" },
          abilityOf: {},
          abilityOfAnyZone: true,
          text: "Spend this mana only to activate an ability or cast an artifact spell.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
