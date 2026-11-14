import { defineCard } from "../define.js";

// EDHREC rank 7994.
//
// "Creatures attacking enchanted player": attacking the player this Curse
// enchants, not a planeswalker or battle of theirs (rule 506.3), whoever
// controls them. The trigger fires once for each creature that dealt combat
// damage to that player (the ruling), and "that creature's controller" is the
// trigger controller (Gonti, Night Minister's shape): the top card of the
// enchanted player's library is exiled, and its permission — play it this
// turn, mana spent as though any color — is that creature's controller's.
//
// Rulings:
//   [2021-11-19] Curse of Hospitality's triggered ability triggers once for each creature that
//     dealt combat damage to the enchanted player.

const TRAMPLE_TEXT = "Creatures attacking enchanted player have trample.";
const DAMAGE_TEXT =
  "Whenever a creature deals combat damage to enchanted player, that player exiles the top card of their library. Until end of turn, that creature's controller may play that card and they may spend mana as though it were mana of any color to cast that spell.";

export default defineCard({
  name: "Curse of Hospitality",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TRAMPLE_TEXT}\n${DAMAGE_TEXT}`,
  targets: ["player"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attackingEnchantedPlayer: true } },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "any", filter: { type: "creature" }, toEnchantedPlayer: true },
      targets: [],
      effect: {
        kind: "as-player",
        who: "trigger-controller",
        effect: {
          kind: "impulse-exile",
          amount: 1,
          whose: "trigger-player",
          duration: "end-of-turn",
          spendAs: "any-color",
          play: true,
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
