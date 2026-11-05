import { defineCard } from "../define.js";

const GRANTED =
  "Whenever this creature attacks a player, if no opponent has more life than that player, for each opponent, create a 1/1 white Soldier creature token that's tapped and attacking that opponent.";
const TEXT = `Commander creatures you own have "${GRANTED}"`;

export default defineCard({
  name: "Veteran Soldier",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self", defender: "player" },
          condition: {
            kind: "not",
            of: {
              kind: "of-player",
              player: "an-opponent",
              condition: { kind: "player-compare", stat: "life", compare: "more", than: "that-player" },
            },
          },
          targets: [],
          effect: {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "create-token",
              token: "Soldier Token",
              count: 1,
              tapped: true,
              attacking: { player: "that-player" },
            },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
