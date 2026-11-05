import { defineCard } from "../define.js";

// EDHREC rank 22241.
//
// Dwell on the Past's shape: the cards are tied to the target player's
// graveyard (`sameController`); with the player gone illegal nothing happens,
// with only the cards gone the player still shuffles.
export default defineCard({
  name: "Krosan Reclamation",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  flashback: { cost: "{1}{G}" },
  text: "Target player shuffles up to two target cards from their graveyard into their library.\nFlashback {1}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [
    "player",
    { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 2, sameController: { slot: 0 } },
  ],
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
