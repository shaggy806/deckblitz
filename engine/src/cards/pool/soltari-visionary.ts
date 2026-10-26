import { defineCard } from "../define.js";

// Exodus (EXO). EDHREC rank 12404.
//
// Rulings:
//   [2004-10-04] If the damaged player controls any enchantments, you must choose one to be
//     destroyed. If they do not, nothing happens.
//
// Any damage to a player, not only combat damage (Abyssal Specter's trigger);
// "that player" is the trigger player.

const TRIGGER_TEXT = "Whenever this creature deals damage to a player, destroy target enchantment that player controls.";

export default defineCard({
  name: "Soltari Visionary",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Soltari", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "enchantment" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
