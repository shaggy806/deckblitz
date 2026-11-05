import { defineCard } from "../define.js";

// Once it has left the battlefield, the last ability doesn't exile it (the
// ruling): `exile` of `"source"` acts only on the object it was.
const MANA_TEXT = "{T}: Add {U}.";
const HOUR_TEXT = "{2}{U}: Put an hour counter on this artifact.";
const UPKEEP_TEXT = "At the beginning of each upkeep, put an hour counter on this artifact.";
const TWELVE_TEXT =
  "When the twelfth hour counter is put on this artifact, shuffle your hand and graveyard into your library, then draw seven cards. Exile this artifact.";

export default defineCard({
  name: "Midnight Clock",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${HOUR_TEXT}\n${UPKEEP_TEXT}\n${TWELVE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "hour", amount: 1 },
      resolve: null,
      text: HOUR_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "hour", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "hour", nth: 12 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-graveyard-into-library", target: "you", zones: ["hand", "graveyard"] },
          { kind: "draw", amount: 7 },
          { kind: "exile", target: "source" },
        ],
      },
      resolve: null,
      text: TWELVE_TEXT,
    },
  ],
});
