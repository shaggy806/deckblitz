import { defineCard } from "../define.js";

// The emblem's two instructions are one targeted ability: no draw if its target
// goes illegal (the ruling).
const LOOK_TEXT = "+1: Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.";
const BOLT_TEXT =
  "−3: Ral deals damage to target creature equal to the total number of instant and sorcery cards you own in exile and in your graveyard.";
const EMBLEM_TRIGGER = "Whenever you cast an instant or sorcery spell, this emblem deals 4 damage to any target and you draw two cards.";
const EMBLEM_TEXT = `−8: You get an emblem with "${EMBLEM_TRIGGER}"`;

export default defineCard({
  name: "Ral, Izzet Viceroy",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ral"],
  loyalty: 5,
  text: `${LOOK_TEXT}\n${BOLT_TEXT}\n${EMBLEM_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "damage",
        target: 0,
        amount: {
          aggregate: "count",
          filter: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" },
          in: ["graveyards", "exile"],
        },
      },
      resolve: null,
      text: BOLT_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TRIGGER,
        triggered: [
          {
            trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
            targets: ["any-target"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "damage", amount: 4, target: 0 },
                { kind: "draw", amount: 2 },
              ],
            },
            resolve: null,
            text: EMBLEM_TRIGGER,
          },
        ],
      },
      resolve: null,
      text: EMBLEM_TEXT,
    },
  ],
});
