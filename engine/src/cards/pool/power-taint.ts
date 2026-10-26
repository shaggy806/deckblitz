import { defineCard } from "../define.js";

// EDHREC rank 26544.
//
// Rulings:
//   [2008-10-01] Cycling is an activated ability. Effects that interact with activated abilities
//     (such as Stifle or Rings of Brighthearth) will interact with cycling. Effects that interact
//     with spells (such as Remove Soul or Faerie Tauntings) will not.
//
// "The upkeep of enchanted enchantment's controller" is the upkeep of whoever
// controls it as that upkeep begins — part of the trigger condition
// (`whileCondition`, rule 603.1, Feedback's shape); "that player" is that
// upkeep's player, who chooses whether to pay.

const TEXT =
  "At the beginning of the upkeep of enchanted enchantment's controller, that player loses 2 life unless they pay {2}.";

export default defineCard({
  name: "Power Taint",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  cycling: { cost: "{2}" },
  text: `Enchant enchantment\n${TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  targets: ["enchantment"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "lose-life", amount: 2, who: "active-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
