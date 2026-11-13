import { defineCard } from "../define.js";

// EDHREC rank 4114. `abilityCostModification`'s `firstEachTurn` without
// `targeting`: the first ability of an artifact its controller activates each
// turn, mana abilities included (its ruling), whether Tezzeret was there for
// the earlier one or not. The −2 is Katsumasa's Vehicle split.
const DISCOUNT_TEXT = "The first activated ability of an artifact you activate each turn costs {2} less to activate.";
const PLUS_TEXT = "+1: Draw two cards. Then discard two cards unless you discard an artifact card.";
const MINUS_TEXT =
  "−2: Target artifact becomes an artifact creature. If it isn't a Vehicle, it has base power and toughness 4/4.";
const EMBLEM_TEXT = 'Whenever an artifact you control becomes tapped, draw a card.';
const ULT_TEXT = `−6: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Tezzeret, Betrayer of Flesh",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tezzeret"],
  loyalty: 4,
  text: `${DISCOUNT_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: { type: "artifact" }, byYou: true, reduceGeneric: 2, firstEachTurn: true },
      text: DISCOUNT_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 2, unlessOne: { type: "artifact" } },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["artifact"],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Vehicle" } },
        then: { kind: "become", target: 0, addTypes: ["artifact", "creature"], duration: "permanent" },
        else: { kind: "become", target: 0, power: 4, toughness: 4, addTypes: ["artifact", "creature"], duration: "permanent" },
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        triggered: [
          {
            trigger: { on: "becomes-tapped", who: "you-control", filter: { type: "artifact" } },
            targets: [],
            effect: { kind: "draw", amount: 1 },
            resolve: null,
            text: EMBLEM_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
