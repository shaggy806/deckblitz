import { defineCard } from "../define.js";

// Betrayers of Kamigawa. EDHREC rank 30613.
//
// Rulings:
//   [2005-02-01] Redirected damage retains its information. For example, your opponent attacks you
//     with Slith Firewalker (which reads, in part, "Whenever Slith Firewalker deals combat damage
//     to a player, put a +1/+1 counter on it.") and you block with a creature enchanted with Ward
//     of Piety. If you activate Ward of Piety, targeting your opponent, the Slith's ability
//     triggers during the combat damage step and it gets a +1/+1 counter. It's still combat
//     damage.
//
// Zhalfirin Crusader's redirect shield, put on the enchanted creature as
// Fylgja's is.

const TEXT = "{1}{W}: The next 1 damage that would be dealt to enchanted creature this turn is dealt to any target instead.";

export default defineCard({
  name: "Ward of Piety",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: "attached", amount: 1, redirectTo: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
