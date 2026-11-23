import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). The spell's mana value is read as the
// trigger resolves, from the spell as it last existed if it's gone.

const CAST_TEXT =
  "Whenever you cast a spell, put charge counters equal to four times that spell's mana value on this Vehicle.";
const TURN_TEXT = "Remove 121 charge counters from this Vehicle: Take an extra turn after this one.";

export default defineCard({
  name: "Aetherflux Car",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${CAST_TEXT}\n${TURN_TEXT}\nCrew 1`,
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 121 } },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      text: TURN_TEXT,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 1",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "charge",
        amount: { product: [4, { manaValueOf: "trigger-object" }] },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
