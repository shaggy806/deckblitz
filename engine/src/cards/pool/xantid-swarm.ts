import { defineCard } from "../define.js";

// EDHREC rank 14321.
// Rulings:
//   [2016-06-08] The defending player may cast spells before Xantid Swarm's triggered ability
//     resolves.
//   [2016-06-08] In a multiplayer game, only the player Xantid Swarm attacked is affected. Other
//     defending players may cast spells.

export default defineCard({
  name: "Xantid Swarm",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, defending player can't cast spells this turn.",
  triggered: [
    {
      // "Defending player" is the attack trigger's `"trigger-player"`: the
      // player it attacks, or the controller of the planeswalker it attacks.
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "prohibit", who: "trigger-player", spells: true },
      resolve: null,
      text: "Whenever this creature attacks, defending player can't cast spells this turn.",
    },
  ],
});
