import { defineCard } from "../define.js";

// EDHREC rank 11429. "Don't own" is `ownedBy: "opponent"` from each player's
// own side: anyone else's permanent counts, not only the ones Blim gave.

const TRIGGER =
  "Whenever Blim deals combat damage to a player, that player gains control of target permanent you control. Then each player loses life and discards cards equal to the number of permanents they control but don't own.";

export default defineCard({
  name: "Blim, Comedic Genius",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", filter: { controlledBy: "you" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, who: "trigger-player", untilEndOfTurn: false },
          {
            kind: "lose-life",
            who: "each-player",
            amount: { countOf: { controlledBy: "you", ownedBy: "opponent" }, forEachPlayer: true },
          },
          {
            kind: "discard",
            target: "each-player",
            amount: { countOf: { controlledBy: "you", ownedBy: "opponent" }, forEachPlayer: true },
          },
        ],
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
