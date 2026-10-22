import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Ice Age. EDHREC rank 31415.
//
// The damage trigger is Wanderlust's: each upkeep, with "the enchanted
// creature's controller is the active player" part of the trigger condition;
// "that player" is the active player.

const DAMAGE_TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, this Aura deals 2 damage to that player.";

export default defineCard({
  name: "Maddening Wind",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nCumulative upkeep {G} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${DAMAGE_TEXT}`,
  targets: ["creature"],
  triggered: [
    cumulativeUpkeep("{G}"),
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "active-player" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
