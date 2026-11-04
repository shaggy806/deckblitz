import { defineCard } from "../define.js";

// EDHREC rank 3621.
// Makes Treasure → use "Treasure Token".

export default defineCard({
  name: "Guild Artisan",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: "Commander creatures you own have \"Whenever this creature attacks a player, if no opponent has more life than that player, you create two Treasure tokens.\" (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self", defender: "player" },
          targets: [],
          effect: { kind: "create-token", token: "Treasure Token", count: 2 },
          resolve: null,
          text: "Whenever this creature attacks a player, if no opponent has more life than that player, you create two Treasure tokens.",
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
      text: "Commander creatures you own have \"Whenever this creature attacks a player, if no opponent has more life than that player, you create two Treasure tokens.\"",
    },
  ],
});
