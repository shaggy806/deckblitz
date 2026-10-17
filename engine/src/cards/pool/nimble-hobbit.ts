import { defineCard } from "../define.js";

// EDHREC rank 21129.
//
// Rulings:
//   [2023-06-16] You don't choose a target for Nimble Hobbit's ability at the time it triggers.
//     Rather, a second "reflexive" ability triggers when you sacrifice a Food or pay {2}{W} this
//     way. You choose a target for that ability as it goes on the stack. Each player may respond
//     to this triggered ability as normal.
//   [2024-11-08] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2024-11-08] You can't sacrifice a Food to pay multiple costs. For example, you can't
//     sacrifice a Food token to activate its own ability and also to activate Maraleaf Rider's
//     ability.
//   [2024-11-08] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token. For example, you can sacrifice Tough Cookie (an Artifact Creature — Food
//     Golem) to activate Maraleaf Rider's ability (an ability with "Sacrifice a Food" in its
//     cost).
//   [2024-11-08] Whatever you do, don't eat the delicious cards.

export default defineCard({
  name: "Nimble Hobbit",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Halfling", "Peasant"],
  power: 1,
  toughness: 3,
  text: "Whenever this creature attacks, you may sacrifice a Food or pay {2}{W}. When you do, tap target creature an opponent controls.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // Anthropede's shape: either way out is an option the controller may
      // take, and taking one fires the reflexive trigger (the first ruling).
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { sacrifice: { type: "artifact", subtype: "Food" }, text: "Sacrifice a Food" },
          { pay: "{2}{W}", text: "Pay {2}{W}" },
        ],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature-an-opponent-controls"],
          effect: { kind: "tap", target: 0 },
          text: "When you do, tap target creature an opponent controls.",
        },
      },
      resolve: null,
      text: "Whenever this creature attacks, you may sacrifice a Food or pay {2}{W}. When you do, tap target creature an opponent controls.",
    },
  ],
});
