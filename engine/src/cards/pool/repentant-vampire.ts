import { defineCard } from "../define.js";

// Ruling: with threshold it's white, not white and black (`setColors`).

const DIES_TEXT = "Whenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.";
const THRESHOLD_TEXT =
  'Threshold — As long as there are seven or more cards in your graveyard, this creature is white and has "{T}: Destroy target black creature."';

export default defineCard({
  name: "Repentant Vampire",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}\n${THRESHOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      setColors: ["W"],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [{ kind: "permanent", filter: { type: "creature", colors: ["B"] } }],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: "{T}: Destroy target black creature.",
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
