import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 12856.
//
// The Dawning Archaic's reduction (instant and sorcery cards in your graveyard); "enters
// tapped if it's not your turn" is the check lands' `tappedUnless`, asked as it enters.
const COST_TEXT = "This spell costs {1} less to cast for each instant and sorcery card in your graveyard.";
const TAPPED_TEXT = "This creature enters tapped if it's not your turn.";
const ETB_TEXT = "When this creature enters, tap up to two target creatures.";

export default defineCard({
  name: "Eddymurk Crab",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Crab"],
  power: 5,
  toughness: 5,
  keywords: ["flash"],
  text: `Flash\n${COST_TEXT}\n${TAPPED_TEXT}\n${ETB_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { typesAnyOf: ["instant", "sorcery"] } },
  },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tappedUnless: { kind: "your-turn" } },
      text: TAPPED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
