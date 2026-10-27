import { defineCard } from "../define.js";

// Rulings:
//   [2005-10-01] The target is chosen just after any creatures dealt lethal damage at the same
//     time that the enchanted creature dealt damage have been put into the graveyard. That might
//     include the enchanted creature itself, if it had trample and was blocked, for example.

const TRIGGER_TEXT =
  "Whenever enchanted creature deals combat damage to a player, you may return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Necromantic Thirst",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TRIGGER_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Return target creature card from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
