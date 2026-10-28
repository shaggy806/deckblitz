import { defineCard } from "../define.js";

// EDHREC rank 4061. Rulings (2021-09-24): the static reaches every non-Horror
// creature with a slime counter, however the counter got there; one that
// becomes a Horror is itself again.

const TRIGGER_TEXT = "Whenever this creature enters or attacks, put a slime counter on up to one other target creature.";
const STATIC_TEXT = "Non-Horror creatures with slime counters on them lose all abilities and have base power and toughness 2/2.";
const SLIME = { kind: "add-counter", target: 0, counter: "slime", amount: 1 } as const;
const TARGET = { kind: "optional", of: { kind: "other", of: "creature" } } as const;

export default defineCard({
  name: "Sludge Monster",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 5,
  toughness: 5,
  text: `${TRIGGER_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [TARGET],
      effect: SLIME,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [TARGET],
      effect: SLIME,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", notSubtypes: ["Horror"], counters: { kind: "slime", compare: { op: "gte", n: 1 } } },
      },
      loseAllAbilities: true,
      setBasePt: { power: 2, toughness: 2 },
      text: STATIC_TEXT,
    },
  ],
});
