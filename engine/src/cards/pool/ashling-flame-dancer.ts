import { defineCard } from "../define.js";

// Modern Horizons 3 (MH3).
//
// Rulings: red mana lasts indefinitely while Ashling's on the battlefield, and
// until the end of the step or phase once she's gone; several copies made at
// once each trigger her; a copy of a card in another zone doesn't until it's
// cast.
const MANA = "You don't lose unspent red mana as steps and phases end.";
const MAGECRAFT =
  "Magecraft — Whenever you cast or copy an instant or sorcery spell, discard a card, then draw a card. If this is the second time this ability has resolved this turn, Ashling deals 2 damage to each opponent and each creature they control. If it's the third time, add {R}{R}{R}{R}.";

export default defineCard({
  name: "Ashling, Flame Dancer",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 4,
  toughness: 4,
  text: `${MANA}\n${MAGECRAFT}`,
  static: [{ affects: { scope: "self" }, keepsUnspentMana: ["R"], text: MANA }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", orCopy: true, filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 2 },
            then: {
              kind: "sequence",
              simultaneous: true,
              effects: [
                { kind: "damage", amount: 2, who: "each-opponent" },
                { kind: "damage-all", filter: { type: "creature" }, whose: "each-opponent", amount: 2 },
              ],
            },
          },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 3 },
            then: { kind: "add-mana", mana: "R", amount: 4 },
          },
        ],
      },
      resolve: null,
      text: MAGECRAFT,
    },
  ],
});
