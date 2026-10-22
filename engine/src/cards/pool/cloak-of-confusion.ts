import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 28122.
//
// Rulings:
//   [2013-04-15] An ability that triggers when something "attacks and isn't blocked" triggers in
//     the declare blockers step after blockers are declared if (1) that creature is attacking and
//     (2) no creatures are declared to block it.
//
// "If you do" is the `may`'s `then`: declining keeps its combat damage and
// nobody discards. The defending player is the trigger's `"trigger-player"`.

const TEXT =
  "Whenever enchanted creature attacks and isn't blocked, you may have it assign no combat damage this turn. If you do, defending player discards a card at random.";

export default defineCard({
  name: "Cloak of Confusion",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${TEXT}`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "attached" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have the enchanted creature assign no combat damage this turn, and the defending player discard a card at random?",
        effect: { kind: "assigns-no-combat-damage", target: "trigger-object" },
        then: { kind: "discard", target: "trigger-player", amount: 1, random: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
