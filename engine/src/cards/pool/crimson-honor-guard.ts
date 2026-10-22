import { defineCard } from "../define.js";

// EDHREC rank 17431. It triggers at every player's end step and checks only as
// it resolves whether that player controls a commander — anyone's commander
// counts (the rulings). "That player controls" is read through the active
// player's permanents: yours (`controls`) when it's your end step, one
// opponent's (`opponent-controls`) otherwise, as Spiritual Sanctuary.

const TEXT =
  "At the beginning of each player's end step, this creature deals 4 damage to that player unless they control a commander.";
const ACTIVE_PLAYERS_COMMANDER = { isCommander: true, controlledBy: "active-player" } as const;

export default defineCard({
  name: "Crimson Honor Guard",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 4,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "not",
          of: {
            kind: "any",
            of: [
              { kind: "controls", filter: ACTIVE_PLAYERS_COMMANDER, atLeast: 1 },
              { kind: "opponent-controls", filter: ACTIVE_PLAYERS_COMMANDER, atLeast: 1 },
            ],
          },
        },
        then: { kind: "damage", amount: 4, who: "active-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
