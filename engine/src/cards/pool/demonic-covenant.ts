import { defineCard } from "../define.js";

// EDHREC rank 8445.
//
// Rulings:
//   [2024-09-20] Demonic Covenant's first ability will trigger once for each player you attack
//     with one or more Demons.
//   [2024-09-20] The card types in Magic include artifact, battle, creature, enchantment, instant,
//     kindred, land, planeswalker, and sorcery. Legendary, basic, and snow are supertypes, not
//     card types; Horror and Room are subtypes, not card types.
//   [2024-09-20] Demonic Covenant's last ability will only cause you to sacrifice Demonic Covenant
//     if both cards have the exact same combination of card types. Supertypes and subtypes are
//     not taken into account.
//   [2024-09-20] Creatures that enter attacking are never declared as attackers, and as such,
//     they won't cause Demonic Covenant's first ability to trigger.

const ATTACK = "Whenever one or more Demons you control attack a player, you draw a card and lose 1 life.";
const END =
  "At the beginning of your end step, create a 5/5 black Demon creature token with flying, then mill two cards. If two cards that share all their card types were milled this way, sacrifice this enchantment.";

export default defineCard({
  name: "Demonic Covenant",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["kindred", "enchantment"],
  subtypes: ["Demon"],
  text: `${ATTACK}\n${END}`,
  triggered: [
    {
      // Once for each player attacked by one or more of them (the ruling).
      trigger: { on: "attacks-player", who: "you", defender: "any", filter: { subtype: "Demon" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "5/5 Demon Token", count: 1 },
          { kind: "mill", target: "you", amount: 2 },
          {
            // The exact same combination of card types (the ruling).
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", sharing: "all-card-types", atLeast: 2 },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: END,
    },
  ],
});
