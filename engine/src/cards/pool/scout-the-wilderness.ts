import { defineCard } from "../define.js";

const FETCH = {
  kind: "search-library",
  filter: { supertype: "basic", type: "land" },
  destination: "battlefield",
  min: 0,
  max: 1,
  enterTapped: true,
} as const;

// Ruling (2022-09-09): kicked, the two Soldiers are made whether or not the
// search found a land.
export default defineCard({
  name: "Scout the Wilderness",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Kicker {1}{W} (You may pay an additional {1}{W} as you cast this spell.)\n" +
    "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. If this spell was kicked, create two 1/1 white Soldier creature tokens.",
  targets: [],
  effect: FETCH,
  kicker: {
    cost: "{1}{W}",
    effect: {
      kind: "sequence",
      effects: [FETCH, { kind: "create-token", token: "Soldier Token", count: 2 }],
    },
  },
});
