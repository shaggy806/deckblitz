import { defineCard } from "../define.js";

// EDHREC rank 13700.
//
// Rulings:
//   [2017-08-25] If more than one equipped creature you control attacks, Nazahn's last ability
//     triggers once for each of those creatures.
//   [2017-08-25] If a creature is attacking a planeswalker, its controller is that creature's
//     defending player.
//   [2017-08-25] Nazahn's last ability can target a creature controlled only by the defending
//     player who is being attacked by the attacking creature that caused the ability to trigger.
//
// A found Hammer of Nazahn goes onto the battlefield, anything else into the
// hand, no choice (`instead`, `pick: "all"`). The tap's target is controlled
// by the player the triggering creature attacks (Thunder Lasso's
// `"trigger-player"`).
const ENTER_TEXT =
  "When Nazahn enters, search your library for an Equipment card and reveal it. If you reveal a card named Hammer of Nazahn this way, put it onto the battlefield. Otherwise, put that card into your hand. Then shuffle.";
const ATTACK_TEXT =
  "Whenever an equipped creature you control attacks, you may tap target creature defending player controls.";

export default defineCard({
  name: "Nazahn, Revered Bladesmith",
  manaCost: "{4}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Artificer"],
  power: 5,
  toughness: 4,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Equipment" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
        instead: { destination: "battlefield", filter: { name: "Hammer of Nazahn" }, pick: "all" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: { equipped: true } },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Tap target creature defending player controls?",
        effect: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
