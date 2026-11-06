import { defineCard } from "../define.js";

// EDHREC rank 26372.
// "Differently named lands" counts each name once (The Necrobloom's
// `distinctNames`). The base power and toughness set by the second ability
// last indefinitely (no duration is printed).

const MAIN_TEXT =
  "At the beginning of your first main phase, draw a card. Then discard a card unless you control five or more differently named lands.";
const BASE_TEXT =
  "{6}{U}: Seven of Nine's base power and toughness become 7/9. Activate only if you control seven or more differently named lands.";

const distinctLands = (atLeast: number) =>
  ({ kind: "controls", filter: { type: "land" }, atLeast, distinctNames: true }) as const;

export default defineCard({
  name: "Seven of Nine, Unassimilated",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Officer"],
  power: 0,
  toughness: 4,
  text: `${MAIN_TEXT}\n${BASE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "not", of: distinctLands(5) },
            then: { kind: "discard", target: "you", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: MAIN_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}{U}", tap: false },
      condition: distinctLands(7),
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 7,
        toughness: 9,
        addTypes: [],
        addSubtypes: [],
        duration: "permanent",
      },
      resolve: null,
      text: BASE_TEXT,
    },
  ],
});
