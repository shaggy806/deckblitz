import { defineCard } from "../define.js";

// EDHREC rank 20823.
//
// Rulings:
//   [2011-01-22] Removing an attacking creature from combat doesn't untap that creature.
//   [2011-01-22] Because Lost in the Woods will trigger once for each creature that attacks you or
//     a planeswalker you control, it's important to specify which trigger is associated with which
//     attacking creature before revealing any cards.
//
// One trigger per attacker (Isperia's `attackingYou`), that attacker its
// trigger object; inside `reveal-top`'s `then` the revealed card is target 0.

const TEXT =
  "Whenever a creature attacks you or a planeswalker you control, reveal the top card of your library. If it's a Forest card, remove that creature from combat. Then put the revealed card on the bottom of your library.";

export default defineCard({
  name: "Lost in the Woods",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true },
      targets: [],
      effect: {
        kind: "reveal-top",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { subtype: "Forest" } },
              then: { kind: "remove-from-combat", target: "trigger-object" },
            },
            { kind: "put-on-library", target: 0, position: "bottom" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
