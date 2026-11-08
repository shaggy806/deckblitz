import { defineCard } from "../define.js";

const UPKEEP = "At the beginning of each player's upkeep, this enchantment deals 1 damage to them.";
const FREE = "Whenever a player casts a spell, if no mana was spent to cast that spell, this enchantment deals 5 damage to that player.";
const NO_GAIN = "{R}: Your opponents can't gain life this turn.";

// "Your opponents can't gain life this turn" is a timed static: Erebos's
// `would-gain-life` replacement, "you" this ability's controller.
export default defineCard({
  name: "Roiling Vortex",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${FREE}\n${NO_GAIN}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "active-player" },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "cast-spell", who: "any", filter: { manaSpent: [{ amount: { op: "eq", n: 0 } }] } },
      targets: [],
      effect: { kind: "damage", amount: 5, who: "trigger-controller" },
      resolve: null,
      text: FREE,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "timed-static",
        duration: "end-of-turn",
        static: [
          {
            affects: { scope: "self" },
            replacement: { event: "would-gain-life", who: "opponent", prevent: true },
            text: "Your opponents can't gain life this turn.",
          },
        ],
        text: "Your opponents can't gain life this turn.",
      },
      resolve: null,
      text: NO_GAIN,
    },
  ],
});
