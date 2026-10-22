import { defineCard } from "../define.js";

// Fallen Empires (FEM). EDHREC rank 27227.
//
// Rulings:
//   The defending player gets to choose which cards they discard.
//
// The defending player is the unblocked trigger's trigger player. "If you
// do" is the sacrifice's own tail: nothing is discarded if the Thrull left
// the battlefield before it resolved.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may sacrifice it. If you do, defending player discards three cards.";

export default defineCard({
  name: "Mindstab Thrull",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Mindstab Thrull to have the defending player discard three cards?",
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
