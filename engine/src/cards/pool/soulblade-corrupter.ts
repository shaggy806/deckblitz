import { defineCard } from "../define.js";

// EDHREC rank 27201. Battlebond.
//
// Rulings:
//   [2018-06-08] Soulblade Corrupter's last ability will trigger if a creature an opponent
//     controls with a +1/+1 counter on it attacks another player who's also your opponent.
//   [2018-06-08] ... won't trigger if a creature without any +1/+1 counters on it attacks and
//     receives a +1/+1 counter any time after attacking.
//   [2018-06-08] ... won't trigger if a creature attacks a planeswalker.
// "Attacks one of your opponents" is `attackingOpponent` (the player, rule
// 508.3a), whoever controls the attacker; the counter is asked as it attacks.
const ATTACK_TEXT =
  "Whenever a creature with a +1/+1 counter on it attacks one of your opponents, that creature gains deathtouch until end of turn.";

export default defineCard({
  name: "Soulblade Corrupter",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  pairing: { kind: "partner-with", name: "Soulblade Renewer" },
  text: `Partner with Soulblade Renewer (When this creature enters, target player may put Soulblade Renewer into their hand from their library, then shuffle.)\nDeathtouch\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Soulblade Renewer?",
        effect: {
          kind: "search-library",
          filter: { name: "Soulblade Renewer" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Soulblade Renewer, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: {
        on: "attacks",
        who: "any",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } }, attackingOpponent: true },
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
