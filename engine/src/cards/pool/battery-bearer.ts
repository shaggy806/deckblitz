import { defineCard } from "../define.js";

// EDHREC rank 25904. Cryptolith Rite's granted mana ability, carrying a
// Powerstone's spend restriction (The Mightstone and Weakstone's
// `notSpell`); a creature still can't tap for it the turn it arrives unless
// it has haste. The draw is Kozilek's Unsealing's cast trigger.
const GRANT_TEXT =
  'Creatures you control have "{T}: Add {C}. This mana can\'t be spent to cast a nonartifact spell."';
const CAST_TEXT = "Whenever you cast an artifact spell with mana value 6 or greater, draw a card.";

export default defineCard({
  name: "Battery Bearer",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 4,
  text: `${GRANT_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "add-mana",
            mana: "C",
            amount: 1,
            spendOnly: {
              notSpell: { notTypes: ["artifact"] },
              text: "This mana can't be spent to cast a nonartifact spell.",
            },
          },
          resolve: null,
          text: "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { type: "artifact", manaValue: { op: "gte", n: 6 } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
