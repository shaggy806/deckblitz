import { defineCard } from "../define.js";

// Conspiracy: Take the Crown. EDHREC rank 12822.
//
// One trigger per attacking creature, each about the player that creature
// attacks (or the controller of the planeswalker it attacks) — the
// "defending player" of the trigger's own event (the rulings).
const TEXT = "Whenever a creature you control attacks, defending player loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Campaign of Vengeance",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "trigger-player", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
