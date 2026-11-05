import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// EDHREC rank 31364.
//
// Thoughtbound Primoc's shape. An intervening "if" (rule 603.4), read as it would trigger and again
// as it resolves: a tie for the most creatures, and nobody qualifies. The one who controls the most
// is found as it resolves, and may be its controller already.

const TEXT =
  "At the beginning of your upkeep, if a player controls more creatures than each other player, the player who controls the most creatures gains control of this creature.";

const MOST_CREATURES: StaticCondition = {
  kind: "player-compare",
  stat: { controls: { type: "creature" } },
  compare: "more",
  than: "each-opponent",
};

export default defineCard({
  name: "Wild Mammoth",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "of-player", player: "a-player", condition: MOST_CREATURES },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        whoIf: { kind: "of-player", player: "that-player", condition: MOST_CREATURES },
        effect: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "that-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
