import { defineCard } from "../define.js";

const GRANTED =
  "Whenever this creature attacks a player, if no opponent has more life than that player, another target creature you control gets +X/+X until end of turn, where X is this creature's power.";
const TEXT = `Commander creatures you own have "${GRANTED}"`;
// "If its power is negative as it resolves, X is 0" (its ruling).
const X = { difference: [{ powerOf: "source" }, 0] } as const;

export default defineCard({
  name: "Hardy Outlander",
  manaCost: "{1}{G}",
  colors: ["G"],
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
          targets: [{ kind: "other", of: "creature-you-control" }],
          effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
