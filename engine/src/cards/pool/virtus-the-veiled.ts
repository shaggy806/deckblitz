import { defineCard } from "../define.js";

// EDHREC rank 7861. Battlebond.
//
// Rulings:
//   [2018-06-08] "Partner with [name]" represents two abilities. The first is a triggered ability:
//     "When this permanent enters the battlefield, target player may search their library for a
//     card named [name], reveal it, put it into their hand, then shuffle their library."
//   [2018-06-08] Virtus's last ability triggers and resolves after combat damage is dealt. For
//     example, if Virtus deals 1 combat damage to a player with 10 life, combat damage will reduce
//     that player's life total to 9. Then its ability will cause the player to lose 5 life,
//     leaving the player at 4.
// The half is of the life total as the ability resolves (Radioactive Man's shape).

export default defineCard({
  name: "Virtus the Veiled",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Azra", "Assassin"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  pairing: { kind: "partner-with", name: "Gorm the Great" },
  text: "Partner with Gorm the Great (When this creature enters, target player may put Gorm into their hand from their library, then shuffle.)\nDeathtouch\nWhenever Virtus deals combat damage to a player, that player loses half their life, rounded up.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Gorm the Great?",
        effect: {
          kind: "search-library",
          filter: { name: "Gorm the Great" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Gorm the Great, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
      resolve: null,
      text: "Whenever Virtus deals combat damage to a player, that player loses half their life, rounded up.",
    },
  ],
});
