import { defineCard } from "../define.js";

// EDHREC rank 18465.
//
// "A permanent you neither own nor control" is one an opponent controls
// (`whose`) and an opponent owns (`ownedBy`) — not necessarily the same one
// (the second ruling). The exchange is `exchange-control`'s: nothing happens
// unless both are on the battlefield under different controllers (rule
// 701.12b), whoever controls this enchantment by then (the third ruling).
//
// Rulings:
//   [2012-10-01] The exchange occurs only if Conjured Currency and the target permanent are both
//     on the battlefield and controlled by different players when the ability resolves. In
//     addition, the target permanent must be one you neither own nor control. If any of these
//     things aren't true when the ability tries to resolve, the exchange won't happen and neither
//     permanent will change controllers.
//   [2012-10-01] The only legal target for Conjured Currency's ability is a permanent both owned
//     and controlled by another player, although it doesn't have to be the same player. For
//     example, a permanent owned by an opponent but controlled by your teammate (or another
//     opponent) could be chosen as the target.
//   [2012-10-01] You don't necessarily have to control Conjured Currency when its ability resolves
//     in order for the exchange to happen. If another player has gained control of Conjured
//     Currency while the ability is on the stack, and a third player controls the target (and you
//     don't own it), you may choose to have those two players exchange control of the relevant
//     permanents.

const TEXT =
  "At the beginning of your upkeep, you may exchange control of this enchantment and target permanent you neither own nor control.";

export default defineCard({
  name: "Conjured Currency",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { ownedBy: "opponent" } }],
      effect: {
        kind: "may",
        prompt: "Exchange control of Conjured Currency and the target permanent?",
        effect: { kind: "exchange-control", objects: ["source", 0] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
