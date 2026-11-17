import { cumulativeUpkeep } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 30307.
//
// Rulings:
//   [2008-04-01] In other words, if you sacrifice Heart of Bogardan rather than pay its cumulative
//     upkeep, X is equal to the amount of mana last spent to pay its cumulative upkeep.
//
// "When a player doesn't pay this enchantment's cumulative upkeep" is the
// `cumulative-upkeep-unpaid` event, announced while the upkeep ability
// resolves, before the sacrifice: this triggers then and goes on the stack
// once that has finished (rule 603.2), choosing its target as it's put
// there (603.3d). X is read from the age counters as the enchantment last
// existed on the battlefield (608.2h): twice them minus 2, the mana last
// paid, as the ruling says. The damage is the enchantment's, dealt to the
// player or planeswalker and each creature of that player (or that
// planeswalker's controller) at once — Bonfire of the Damned's shape.

const UPKEEP_TEXT =
  "Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const UNPAID_TEXT =
  "When a player doesn't pay this enchantment's cumulative upkeep, this enchantment deals X damage to target player or planeswalker and each creature that player or that planeswalker's controller controls, where X is twice the number of age counters on this enchantment minus 2.";

const X = { difference: [{ product: [2, { countersOn: "source", counter: "age" }] }, 2] } as const;

export default defineCard({
  name: "Heart of Bogardan",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${UNPAID_TEXT}`,
  triggered: [
    cumulativeUpkeep("{2}"),
    {
      trigger: { on: "event", event: "cumulative-upkeep-unpaid", who: "self" },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: X, target: 0 },
          { kind: "damage-all", filter: { type: "creature" }, amount: X, controlledByTarget: 0 },
        ],
      },
      resolve: null,
      text: UNPAID_TEXT,
    },
  ],
});
