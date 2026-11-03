import { defineCard } from "../define.js";

// Mirage. Black Vise's chosen opponent, with an `unless` naming them; the
// payment is read as the trigger resolves, {0} with no vortex counters.

const CHOOSE = "As this enchantment enters, choose an opponent.";
const CLEAR = "At the beginning of your upkeep, remove all vortex counters from this enchantment.";
const VORTEX =
  "At the beginning of the chosen player's upkeep, this enchantment deals 3 damage to that player unless they pay {1} for each vortex counter on this enchantment.";
const PUMP = "{X}: Put X vortex counters on this enchantment. Activate only during your upkeep.";

export default defineCard({
  name: "Energy Vortex",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${CHOOSE}\n${CLEAR}\n${VORTEX}\n${PUMP}`,
  choosePlayerOnEnter: "opponent",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "vortex", amount: "all" },
      resolve: null,
      text: CLEAR,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "chosen-player" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "chosen-player",
        options: [{ payGeneric: { countersOn: "source", counter: "vortex" }, text: "Pay {X}" }],
        otherwise: { kind: "damage", amount: 3, who: "chosen-player" },
      },
      resolve: null,
      text: VORTEX,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: false },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "vortex", amount: "x" },
      resolve: null,
      text: PUMP,
    },
  ],
});
