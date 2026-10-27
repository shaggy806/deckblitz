import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// Apocalypse (APC). EDHREC rank 30516. Copper Tablet's trigger, behind an
// intervening-if (rule 603.4) read off the active player's lands.
//
// "Four or more basic land types among lands that player controls" is
// spelled out: some four of the five types each on a land the active player
// controls. A land is read through its filter's `controlledBy:
// "active-player"`, so `controls` holds only on your own upkeep and
// `opponent-controls` only on the active opponent's.
const BASIC_TYPES = ["Plains", "Island", "Swamp", "Mountain", "Forest"] as const;

const activeControls = (subtype: string): StaticCondition => {
  const filter = { type: "land", subtype, controlledBy: "active-player" } as const;
  return {
    kind: "any",
    of: [
      { kind: "controls", filter, atLeast: 1 },
      { kind: "opponent-controls", filter, atLeast: 1 },
    ],
  };
};

const FOUR_TYPES: StaticCondition = {
  kind: "any",
  of: BASIC_TYPES.map((left) => ({
    kind: "all",
    of: BASIC_TYPES.filter((t) => t !== left).map(activeControls),
  })),
};

const TEXT =
  "At the beginning of each player's upkeep, if there are four or more basic land types among lands that player controls, this artifact deals 3 damage to that player.";

export default defineCard({
  name: "Mask of Intolerance",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: FOUR_TYPES,
      targets: [],
      effect: { kind: "damage", amount: 3, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
