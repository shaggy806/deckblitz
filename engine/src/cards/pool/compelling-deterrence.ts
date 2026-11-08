import { defineCard } from "../define.js";

/** "If you control a Zombie" is checked after the bounce (its ruling): the
 * `conditional` follows the `return-to-hand` in the sequence. */
export default defineCard({
  name: "Compelling Deterrence",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target nonland permanent to its owner's hand. Then that player discards a card if you control a Zombie.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Zombie" }, atLeast: 1 },
        then: { kind: "discard", target: { ownerOf: 0 }, amount: 1 },
      },
    ],
  },
});
