import { defineCard } from "../define.js";

// EDHREC rank 6031.

export default defineCard({
  name: "Sword Coast Sailor",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: "Commander creatures you own have \"Whenever this creature attacks a player, if no opponent has more life than that player, this creature can't be blocked this turn.\"",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self", defender: "player" },
          targets: [],
          effect: {
            kind: "grant-keyword",
            target: "source",
            keyword: "unblockable",
            duration: "end-of-turn",
          },
          resolve: null,
          text: "Whenever this creature attacks a player, if no opponent has more life than that player, this creature can't be blocked this turn.",
          condition: {
            kind: "not",
            of: {
              kind: "of-player",
              player: "an-opponent",
              condition: { kind: "player-compare", stat: "life", compare: "more", than: "that-player" },
            },
          },
        },
      ],
      text: "Commander creatures you own have \"Whenever this creature attacks a player, if no opponent has more life than that player, this creature can't be blocked this turn.\"",
    },
  ],
});
