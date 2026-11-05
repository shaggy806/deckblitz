import { defineCard } from "../define.js";

// EDHREC rank 14403.
//
// Rulings:
//   [2011-09-22] You don't have to target any cards when you cast Memory's Journey, but you must
//     target a player.
//   [2011-09-22] If no cards were targeted by Memory's Journey or if all the targeted cards are
//     illegal targets by the time Memory's Journey resolves, the targeted player will still
//     shuffle their library.
//   [2011-09-22] If the player is an illegal target by the time Memory's Journey resolves, the
//     spell will have no effect, even if the cards are still legal targets.
//   [2011-09-22] If you cast Memory's Journey with flashback, it won't be in the graveyard when you
//     choose targets. It can't target itself.
//
// Dwell on the Past's shape.
export default defineCard({
  name: "Memory's Journey",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  flashback: { cost: "{G}" },
  text: "Target player shuffles up to three target cards from their graveyard into their library.\nFlashback {G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [
    "player",
    { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 3, sameController: { slot: 0 } },
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
