import { defineCard } from "../define.js";

// EDHREC rank 31312.
//
// Rulings:
//   [2004-10-04] Does prevent the use of activated mana abilities with {T} in the cost.
//   [2016-06-08] Activated abilities contain a colon. They're generally written "[Cost]:
//     [Effect]." Some keywords are activated abilities and will have colons in their reminder
//     text.

export default defineCard({
  name: "Serra Bestiary",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAt the beginning of your upkeep, sacrifice this Aura unless you pay {W}{W}.\nEnchanted creature can't attack or block, and its activated abilities with {T} in their costs can't be activated.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{W}{W}", text: "Pay {W}{W}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice this Aura unless you pay {W}{W}.",
    },
  ],
  static: [
    {
      // Only its {T} abilities, mana abilities among them.
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true }, onlyTapAbilities: true },
      text: "Enchanted creature can't attack or block, and its activated abilities with {T} in their costs can't be activated.",
    },
  ],
});
