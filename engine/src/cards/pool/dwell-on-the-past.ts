import { defineCard } from "../define.js";

export default defineCard({
  name: "Dwell on the Past",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target player shuffles up to four target cards from their graveyard into their library.",
  targets: [
    "player",
    { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 4, sameController: { slot: 0 } },
  ],
  // With the player gone illegal, they do nothing (Witness the Future's
  // shape); with only the cards gone, they still shuffle.
  effect: {
    kind: "conditional",
    condition: { kind: "target-legal", index: 0 },
    then: {
      kind: "sequence",
      effects: [
        {
          kind: "for-each-target",
          from: 1,
          simultaneous: true,
          effect: { kind: "put-on-library", target: 1, position: "top" },
        },
        { kind: "shuffle-library", target: 0 },
      ],
    },
  },
});
