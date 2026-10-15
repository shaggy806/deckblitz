import { defineCard } from "../define.js";

// EDHREC rank 19737.
//
// Rulings:
//   [2025-02-07] “Max speed — [ability]” means “As long as you have max speed, this object has
//     [ability].” If the granted ability functions in a zone other than the battlefield, the max
//     speed ability does too.
//   [2025-02-07] A player “has max speed” if their speed is 4.
//   [2025-02-07] If an effect needs to know what a player’s speed is and that player doesn’t have
//     a speed, their speed is considered 0.
//   [2025-02-07] Start your engines! isn’t a triggered ability. Increasing your speed to 1 is
//     something that happens as a state-based action as soon as you control a permanent with the
//     ability. Notably, this includes gaining control of a permanent with the ability that another
//     player controls.
//   [2025-02-07] Each player tracks their speed (or lack thereof) separately. Increasing your
//     speed has no effect on whether another player has speed.
//   [2025-02-07] Your speed doesn’t change until a spell or ability says so, such as the inherent
//     triggered ability that cares about opponents losing life during your turn. Notably, losing
//     control of permanents with start your engines! doesn’t affect your speed.

export default defineCard({
  name: "Gastal Raider",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["start-your-engines"],
  text: "Start your engines!\nWhen this creature enters, target opponent reveals their hand. You choose an instant or sorcery card from it. That player discards that card.\nMax speed — This creature gets +1/+1 and has menace.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { typesAnyOf: ["instant", "sorcery"] } },
      resolve: null,
      text: "When this creature enters, target opponent reveals their hand. You choose an instant or sorcery card from it. That player discards that card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPt: [1, 1],
      grantKeywords: ["menace"],
      text: "Max speed — This creature gets +1/+1 and has menace.",
      condition: { kind: "speed", atLeast: 4 },
    },
  ],
});
