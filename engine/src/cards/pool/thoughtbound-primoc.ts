import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// An intervening "if" (rule 603.4), read as it would trigger and again as it resolves: a tie for
// the most Wizards, or no Wizards at all, and nobody qualifies. The one who controls the most is
// found as it resolves, and may be its controller already.
const TEXT =
  "At the beginning of your upkeep, if a player controls more Wizards than each other player, the player who controls the most Wizards gains control of this creature.";

const MOST_WIZARDS: StaticCondition = {
  kind: "player-compare",
  stat: { controls: { subtype: "Wizard" } },
  compare: "more",
  than: "each-opponent",
};

export default defineCard({
  name: "Thoughtbound Primoc",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bird", "Beast"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "of-player", player: "a-player", condition: MOST_WIZARDS },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        whoIf: { kind: "of-player", player: "that-player", condition: MOST_WIZARDS },
        effect: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "that-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
