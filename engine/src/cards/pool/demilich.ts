import { defineCard } from "../define.js";

// EDHREC rank 16871.
//
// The reduction counts the instant and sorcery spells you've cast this turn,
// each as it was cast (a copy isn't cast); with no generic mana in its cost,
// a {U} past the fourth takes nothing off (rule 118.7c). The attack trigger's
// copy is cast as it resolves, paying its costs, or not at all; it's made in
// exile and cast from there. "By exiling four instant and/or sorcery cards" is
// an additional cost of a cast from the graveyard (601.2f).

const REDUCTION_TEXT = "This spell costs {U} less to cast for each instant and sorcery spell you've cast this turn.";
const ATTACK_TEXT =
  "Whenever this creature attacks, exile up to one target instant or sorcery card from your graveyard. Copy it. You may cast the copy.";
const GRAVEYARD_TEXT =
  "You may cast this card from your graveyard by exiling four instant and/or sorcery cards from your graveyard in addition to paying its other costs.";

export default defineCard({
  name: "Demilich",
  manaCost: "{U}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Skeleton", "Wizard"],
  power: 4,
  toughness: 3,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceColored: "{U}",
    reduceColoredTimes: { castThisTurn: { typesAnyOf: ["instant", "sorcery"] } },
  },
  mayPlaySelf: { from: ["graveyard"], exileOthers: 4, exileFilter: { typesAnyOf: ["instant", "sorcery"] } },
  text: `${REDUCTION_TEXT}\n${ATTACK_TEXT}\n${GRAVEYARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "cast-now", from: "exiled-this-way", copies: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
