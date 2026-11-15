import { defineCard } from "../define.js";

// EDHREC rank 22402.

const HISTORIC_TEXT =
  "Whenever another historic permanent you control with mana value 3 or greater enters, draw a card. (Artifacts, legendaries, and Sagas are historic.)";
const SEEK_TEXT =
  "Seek out — Whenever you draw your second card each turn, put a +1/+1 counter on up to one other target creature and two charge counters on up to one target Spacecraft.";

// The two targets are separate words "target" (rule 115.3): one Spacecraft
// creature may be both.
export default defineCard({
  name: "Jean-Luc Picard, Luminary",
  manaCost: "{1}{U}{R}{W}",
  colors: ["U", "R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 4,
  text: `${HISTORIC_TEXT}\n${SEEK_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        otherOnly: true,
        filter: {
          anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }],
          manaValue: { op: "gte", n: 3 },
        },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: HISTORIC_TEXT,
    },
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [
        { kind: "optional", of: { kind: "other", of: "creature" } },
        { kind: "optional", of: { kind: "permanent", filter: { subtype: "Spacecraft" } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "charge", amount: 2 },
        ],
      },
      resolve: null,
      text: SEEK_TEXT,
    },
  ],
});
