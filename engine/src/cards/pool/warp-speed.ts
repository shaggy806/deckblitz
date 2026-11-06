import { defineCard } from "../define.js";

// EDHREC rank 30269.

const UNTAPPED_TEXT = "Lands you control enter untapped.";
const SEARCH_TEXT =
  "When this enchantment enters, search your library for a basic land card or Planet card, reveal it, put it into your hand, then shuffle.";
const SNW_TEXT =
  "Strange new worlds — {7}{U}{U}, Sacrifice this enchantment: Draw two cards. This ability costs {X} less to activate, where X is the number of differently named lands you control.";

export default defineCard({
  name: "Warp Speed",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${UNTAPPED_TEXT}\n${SEARCH_TEXT}\n${SNW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "others-enter-battlefield", filter: { type: "land", controlledBy: "you" }, untapped: true },
      text: UNTAPPED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { anyOf: [{ supertype: "basic", type: "land" }, { subtype: "Planet" }] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{7}{U}{U}", tap: false, sacrifice: "self" },
      costReduction: {
        reduceGeneric: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: SNW_TEXT,
    },
  ],
});
