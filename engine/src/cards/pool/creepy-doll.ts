import { defineCard } from "../define.js";

// EDHREC rank 8987.
//
// Rulings:
//   [2011-09-22] You don’t flip the coin until the ability resolves. If you want to respond to the
//     ability, perhaps by regenerating the damaged creature, you’ll have to do so before you know
//     the outcome of the flip.
//   [2011-09-22] If the combat damage Creepy Doll deals to a creature is lethal, you’ll still flip
//     a coin. If the creature is still on the battlefield (perhaps because it regenerated), it
//     could be destroyed a second time, depending on the coin flip.
//
// Stinkweed Imp's trigger, with the destroy behind a coin flip made as it
// resolves.

const TRIGGER =
  "Whenever this creature deals combat damage to a creature, flip a coin. If you win the flip, destroy that creature.";

export default defineCard({
  name: "Creepy Doll",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  keywords: ["indestructible"],
  text: `Indestructible\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "flip-coin", won: { kind: "destroy", target: "trigger-recipient" } },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
