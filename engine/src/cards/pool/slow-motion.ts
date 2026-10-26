import { defineCard } from "../define.js";

// Rulings:
//   You choose whether to pay or not on resolution. If not, then you sacrifice the creature.
//   You can choose to not pay if you no longer control the creature on resolution.

export default defineCard({
  name: "Slow Motion",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAt the beginning of the upkeep of enchanted creature's controller, that player sacrifices that creature unless they pay {2}.\nWhen this Aura is put into a graveyard from the battlefield, return it to its owner's hand.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "sacrifice-target", target: "attached", byItsController: true },
      },
      resolve: null,
      text: "At the beginning of the upkeep of enchanted creature's controller, that player sacrifices that creature unless they pay {2}.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.",
    },
  ],
});
