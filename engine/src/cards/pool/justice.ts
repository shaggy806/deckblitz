import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 27902.
//
// "Whenever a red creature or spell deals damage" is `deals-damage` from any
// source, the source red and a creature or a spell. With no recipient named it
// triggers once per damage event, so a source dealing damage to several at
// once is one trigger for the total (its ruling); "that creature's or spell's
// controller" is the source's controller (`trigger-controller`), as Backfire
// reads it.
//
// Rulings:
//   - The damage is dealt by a triggered ability, put on the stack just after the red creature
//     or spell deals its damage.
//   - A single source dealing damage to several at once is added up and dealt at one time.

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {W}{W}.";
const DAMAGE_TEXT =
  "Whenever a red creature or spell deals damage, this enchantment deals that much damage to that creature's or spell's controller.";

export default defineCard({
  name: "Justice",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{W}{W}", text: "Pay {W}{W}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: {
        on: "deals-damage",
        who: "any",
        filter: { colors: ["R"], anyOf: [{ type: "creature" }, { isSpell: true }] },
      },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "trigger-controller" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
