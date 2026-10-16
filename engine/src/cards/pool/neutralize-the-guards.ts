import { defineCard } from "../define.js";

// EDHREC rank 17935.

// One target: an opponent gone illegal by resolution (hexproof) means the
// spell doesn't resolve, and there's no surveil (rule 608.2b).
export default defineCard({
  name: "Neutralize the Guards",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Creatures target opponent controls get -1/-1 until end of turn. Surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 0,
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      { kind: "surveil", amount: 2 },
    ],
  },
});
