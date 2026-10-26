import { defineCard } from "../define.js";

// EDHREC rank 18604. Return to Ravnica.
//
// Rulings:
//   The mana value of a creature token is 0, unless that token is a copy of another creature.
//   If the permanent has {X} in its mana cost, X is 0.
//
// Soul Bleed's trigger shape (the upkeep of the enchanted permanent's
// controller); that player pays generic mana equal to the enchanted
// permanent's mana value, read as the trigger resolves, or sacrifices it.

const TEXT =
  "At the beginning of the upkeep of enchanted permanent's controller, that player sacrifices it unless they pay {X}, where X is its mana value.";

export default defineCard({
  name: "Soul Tithe",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant nonland permanent\n${TEXT}`,
  targets: ["nonland-permanent"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ payGeneric: { manaValueOf: "attached" }, text: "Pay {X}" }],
        otherwise: { kind: "sacrifice-target", target: "attached", byItsController: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
