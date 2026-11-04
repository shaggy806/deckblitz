import { defineCard } from "../define.js";

// EDHREC rank 12247.

export default defineCard({
  name: "Peer Pressure",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose a creature type. If you control more creatures of that type than each other player, you gain control of all creatures of that type. (This effect lasts indefinitely.)",
  targets: [],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "conditional",
      // Strictly more than each other player, one at a time (rule 102.3: in a
      // free-for-all every other player is an opponent).
      condition: {
        kind: "player-compare",
        stat: { controls: { type: "creature", subtype: "$chosen" } },
        compare: "more",
        than: "each-opponent",
      },
      then: { kind: "gain-control-all", filter: { type: "creature", subtype: "$chosen" }, untilEndOfTurn: false },
    },
  },
});
