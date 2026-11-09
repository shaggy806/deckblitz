import { defineCard } from "../define.js";

// EDHREC rank 10896. One Equipment can't be moved around among the tokens (the
// ruling): one already attached by this resolution isn't offered again.
export default defineCard({
  name: "Goldwardens' Gambit",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { subtype: "Equipment", controlledBy: "you" } },
  },
  text: "Affinity for Equipment (This spell costs {1} less to cast for each Equipment you control.)\nCreate five 2/2 red Rebel creature tokens. They gain haste until end of turn. For each of those tokens, you may attach an Equipment you control to it.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Rebel Token", count: 5 },
      { kind: "grant-keyword-all", filter: { thisWay: "created" }, keyword: "haste", duration: "end-of-turn" },
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
