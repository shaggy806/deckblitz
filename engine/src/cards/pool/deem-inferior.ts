import { defineCard } from "../define.js";

// EDHREC rank 17907. Modern Horizons 3 (MH3).
//
// The permanent's owner chooses second from the top or the bottom, as Lost
// Days. The reduction counts every card you've drawn this turn (Inspired Fire).

export default defineCard({
  name: "Deem Inferior",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "This spell costs {1} less to cast for each card you've drawn this turn.\nThe owner of target nonland permanent puts it into their library second from the top or on the bottom.",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "cards-drawn", who: "you" },
  },
  targets: ["nonland-permanent"],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: [{ fromTop: 2 }, "bottom"] } },
});
