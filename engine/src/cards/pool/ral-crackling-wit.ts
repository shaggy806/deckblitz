import { defineCard } from "../define.js";

// Bloomburrow. The emblem's storm is a `this-cast` trigger its grant gives each
// instant or sorcery spell its owner casts, as Prismari, the Inspiration's is.
const LOYALTY = "Whenever you cast a noncreature spell, put a loyalty counter on Ral.";
const OTTER = "+1: Create a 1/1 blue and red Otter creature token with prowess.";
const DRAW = "−3: Draw three cards, then discard two cards.";
const STORM =
  "Instant and sorcery spells you cast have storm. (Whenever you cast an instant or sorcery spell, copy it for each spell cast before it this turn.)";
const ULT = `−10: Draw three cards. You get an emblem with "Instant and sorcery spells you cast have storm." (Whenever you cast an instant or sorcery spell, copy it for each spell cast before it this turn.)`;

export default defineCard({
  name: "Ral, Crackling Wit",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ral"],
  loyalty: 4,
  text: `${LOYALTY}\n${OTTER}\n${DRAW}\n${ULT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "loyalty", amount: 1 },
      resolve: null,
      text: LOYALTY,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Otter Token", count: 1 },
      resolve: null,
      text: OTTER,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: DRAW,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          {
            kind: "create-emblem",
            text: STORM,
            static: {
              affects: { scope: "self" },
              grantsToSpells: {
                filter: { typesAnyOf: ["instant", "sorcery"] },
                triggered: [
                  { trigger: { on: "this-cast" }, targets: [], effect: { kind: "storm" }, resolve: null, text: "Storm" },
                ],
              },
              text: STORM,
            },
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
