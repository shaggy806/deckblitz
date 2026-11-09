import { defineCard } from "../define.js";

// EDHREC rank 12010. One Equipment per token, attached all at once (the
// rulings): one already attached by this resolution isn't offered again.
export default defineCard({
  name: "Reckless Crew",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create X 2/1 red Dwarf Berserker creature tokens, where X is the number of Vehicles you control plus the number of Equipment you control. For each of those tokens, you may attach an Equipment you control to it.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "create-token",
        token: "Dwarf Berserker Token",
        count: { sum: [{ countOf: { subtype: "Vehicle", controlledBy: "you" } }, { countOf: { subtype: "Equipment", controlledBy: "you" } }] },
      },
      {
        kind: "for-each-permanent",
        filter: { thisWay: "created" },
        effect: {
          kind: "attach",
          target: 0,
          attachment: {
            choose: { subtype: "Equipment", controlledBy: "you", notThisWay: "attached" },
            prompt: "You may attach an Equipment you control to this token",
            upTo: 1,
          },
        },
      },
    ],
  },
});
