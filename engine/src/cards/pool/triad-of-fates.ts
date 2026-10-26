import { defineCard } from "../define.js";

// EDHREC rank 21562. The flickered creature returns as a new object without
// its fate counter (the ruling). "Its controller draws two cards" is Argent
// Dais's: the exiled creature's controller as it left.
const COUNTER_TEXT = "{1}, {T}: Put a fate counter on another target creature.";
const FLICKER_TEXT =
  "{W}, {T}: Exile target creature that has a fate counter on it, then return it to the battlefield under its owner's control.";
const EXILE_TEXT = "{B}, {T}: Exile target creature that has a fate counter on it. Its controller draws two cards.";

const FATED = {
  kind: "permanent",
  filter: { type: "creature", counters: { kind: "fate", compare: { op: "gte", n: 1 } } },
} as const;

export default defineCard({
  name: "Triad of Fates",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `${COUNTER_TEXT}\n${FLICKER_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "fate", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      cost: { mana: "{W}", tap: true },
      targets: [FATED],
      effect: { kind: "flicker", target: 0 },
      resolve: null,
      text: FLICKER_TEXT,
    },
    {
      cost: { mana: "{B}", tap: true },
      targets: [FATED],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "draw", who: "each-player", amount: { product: [2, { thisWay: "exiled", who: "each" }] } },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
