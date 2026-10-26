import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 22981. Shadow, and Mindstab Thrull's trigger:
// the defending player is the unblocked trigger's trigger player, and
// nothing is discarded if the sacrifice didn't happen.
//
// Rulings:
//   [2013-04-15] An ability that triggers when something "attacks and isn't blocked" triggers in
//     the declare blockers step after blockers are declared.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may sacrifice it. If you do, defending player discards three cards.";

export default defineCard({
  name: "Dauthi Mindripper",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dauthi", "Minion"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Dauthi Mindripper to have the defending player discard three cards?",
        effect: {
          kind: "sacrifice-source",
          then: { kind: "discard", target: "trigger-player", amount: 3 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
