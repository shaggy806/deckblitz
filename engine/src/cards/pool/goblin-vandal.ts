import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 23083.
//
// Rulings:
//   [2008-04-01] If the defending player controls no artifacts that you can target, the ability
//     doesn't go on the stack and you can't pay {R}.
//   [2013-04-15] An ability that triggers when something "attacks and isn't blocked" triggers in
//     the declare blockers step after blockers are declared if (1) that creature is attacking and
//     (2) no creatures are declared to block it.
//
// Floral Spuzzem's shape, the "may" paid for with {R}.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may pay {R}. If you do, destroy target artifact defending player controls and this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Goblin Vandal",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [{ kind: "permanent", whose: "defending-player", filter: { type: "artifact" } }],
      effect: {
        kind: "may",
        prompt: "Pay {R} to destroy the targeted artifact? Goblin Vandal then assigns no combat damage.",
        cost: "{R}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "assigns-no-combat-damage", target: "source" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
