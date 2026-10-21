import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 28909. Battlebond.
//
// Rulings:
//   [2018-06-08] You can't put more than one +1/+1 counter on any one target using the support
//     action.
//   [2018-06-08] Support can target a creature another player controls.
// Support N on a permanent: "each of up to N **other** target creatures"
// (rule 701.41a) — Aerie Auxiliary's shape.
const SUPPORT_TEXT =
  "When this creature enters, support 2. (Put a +1/+1 counter on each of up to two other target creatures.)";

export default defineCard({
  name: "Soulblade Renewer",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  pairing: { kind: "partner-with", name: "Soulblade Corrupter" },
  text: `Partner with Soulblade Corrupter (When this creature enters, target player may put Soulblade Corrupter into their hand from their library, then shuffle.)\n${SUPPORT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Soulblade Corrupter?",
        effect: {
          kind: "search-library",
          filter: { name: "Soulblade Corrupter" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Soulblade Corrupter, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(2, { kind: "other", of: "creature" }, { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: SUPPORT_TEXT,
    },
  ],
});
