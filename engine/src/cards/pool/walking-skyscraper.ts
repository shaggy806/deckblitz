import { defineCard } from "../define.js";

// EDHREC rank 13394.
//
// Rulings:
//   [2022-02-18] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2022-02-18] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.
//   [2022-02-18] An Aura controlled by an opponent does not cause a creature you control to be
//     modified.
//
// The reduction is generic only, so it never touches a coloured pip — and
// this has none ({8}). Hexproof-while-untapped is Paradise Druid's static.
const REDUCTION_TEXT = "This spell costs {1} less to cast for each modified creature you control.";
const HEXPROOF_TEXT = "This creature has hexproof as long as it's untapped.";

export default defineCard({
  name: "Walking Skyscraper",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  text: `${REDUCTION_TEXT} (Equipment, Auras you control, and counters are modifications.)\nTrample\n${HEXPROOF_TEXT} (It can't be the target of spells or abilities your opponents control.)`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "creature", controlledBy: "you", modified: true } },
  },
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
});
