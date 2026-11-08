import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add {U}. Put a time counter on Trenzalore Clocktower.";
const SHUFFLE_TEXT =
  "{1}{U}, {T}, Remove twelve time counters from Trenzalore Clocktower and exile it: Shuffle your graveyard and hand into your library, then draw seven cards. Activate only if you control a Time Lord.";

export default defineCard({
  name: "Trenzalore Clocktower",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: `${MANA_TEXT}\n${SHUFFLE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        also: { kind: "add-counter", target: "source", counter: "time", amount: 1 },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{1}{U}", tap: true, removeCounter: { kind: "time", count: 12 }, do: { kind: "exile", target: "source" } },
      condition: { kind: "controls", filter: { subtype: "Time Lord" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-graveyard-into-library", target: "you", zones: ["graveyard", "hand"] },
          { kind: "draw", amount: 7 },
        ],
      },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
});
