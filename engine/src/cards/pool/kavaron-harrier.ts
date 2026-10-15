import { defineCard } from "../define.js";

// EDHREC rank 16908.
//
// Rulings:
//   [2025-07-25] Although the token you created is put onto the battlefield attacking, it was
//     never declared as an attacking creature.
//   [2025-07-25] You choose the player, planeswalker, or battle the token is attacking. It
//     doesn't have to be the same player, planeswalker, or battle that Kavaron Harrier or any
//     other attacking creatures are attacking.
//
// Kari Zev's shape: the token attacks whom its controller chooses, and a
// delayed ability about the token just made sacrifices it at end of combat.

const TEXT =
  "Whenever this creature attacks, you may pay {2}. If you do, create a 2/2 colorless Robot artifact creature token that's tapped and attacking. Sacrifice that token at end of combat.";

export default defineCard({
  name: "Kavaron Harrier",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Soldier"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to create a 2/2 Robot token that's tapped and attacking?",
        cost: "{2}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Robot Token", count: 1, tapped: true, attacking: "choose" },
            {
              kind: "delayed-trigger",
              at: "end-of-combat",
              about: "created",
              effect: { kind: "sacrifice-target", target: 0 },
              text: "Sacrifice that token at end of combat.",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
