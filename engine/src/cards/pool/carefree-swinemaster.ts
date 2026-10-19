import { defineCard } from "../define.js";

// EDHREC rank 23823.
//
// Rulings:
//   [2022-06-10] You choose which player or planeswalker is being attacked by the Boar token as it
//     enters the battlefield. It doesn't have to be the same player or planeswalker that Carefree
//     Swinemaster is attacking.
//   [2022-06-10] Although the token created is an attacking creature, it was never declared as an
//     attacking creature. This means that abilities that trigger whenever a creature attacks won't
//     trigger when it enters the battlefield attacking.
//   [2022-06-10] While resolving Carefree Swinemaster's triggered ability, you can't pay the cost
//     multiple times to create more than one token.
//
// Kavaron Harrier's shape: a `may` with a cost, and the token attacks whom its
// controller chooses.

const TEXT =
  "Whenever this creature attacks, you may pay {1}{G}. If you do, create a 2/2 green Boar creature token that's tapped and attacking.";

export default defineCard({
  name: "Carefree Swinemaster",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Gnome", "Ranger"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{G} to create a 2/2 Boar token that's tapped and attacking?",
        cost: "{1}{G}",
        effect: { kind: "create-token", token: "Boar Token", count: 1, tapped: true, attacking: "choose" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
