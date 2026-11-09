import { defineCard } from "../define.js";

// EDHREC rank 4552. "One of them": the batch's damage dealers, chosen as it
// resolves; the reveal compares types with the sacrificed creature as it last
// existed (the ruling).

const TEXT =
  "Whenever one or more creatures you control deal combat damage to a player, you may sacrifice one of them. If you do, reveal cards from the top of your library until you reveal a creature card that shares a creature type with the sacrificed creature. Put that card onto the battlefield and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Descendants' Fury",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, to: "player", combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { inSet: "trigger-batch", controlledBy: "you" },
            upTo: 1,
            min: 0,
            prompt: "You may sacrifice one of them.",
            then: { kind: "sacrifice-target", target: 0 },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed" },
            then: {
              kind: "reveal-until",
              filter: { type: "creature", sharesCreatureTypeWith: { thisWay: "sacrificed" } },
              put: "battlefield",
              rest: "bottom-random",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
