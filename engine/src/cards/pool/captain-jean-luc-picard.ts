import { defineCard } from "../define.js";

// EDHREC rank 22706.

const CAST_TEXT = "Whenever you cast a creature or Spacecraft spell, create a 1/1 red Officer creature token.";
const SEARCH_TEXT =
  "Tap seven untapped Officers you control: Search your library for a Spacecraft card, put it onto the battlefield with seven charge counters on it, then shuffle.";

// "Tap seven untapped Officers you control" has no {T}: Picard, an Officer
// himself, may be one of the seven (`includeSelf`).
export default defineCard({
  name: "Captain Jean-Luc Picard",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 3,
  text: `Other creatures you control get +1/+1.\n${CAST_TEXT}\n${SEARCH_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 7, filter: { subtype: "Officer", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Spacecraft" },
        destination: "battlefield",
        min: 0,
        max: 1,
        withCounters: { kind: "charge", amount: 7 },
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] } },
      targets: [],
      effect: { kind: "create-token", token: "Officer Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantPt: [1, 1],
      text: "Other creatures you control get +1/+1.",
    },
  ],
});
