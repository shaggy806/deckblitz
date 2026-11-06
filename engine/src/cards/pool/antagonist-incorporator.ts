import { defineCard } from "../define.js";

// EDHREC rank 24833.

const TEXT =
  'Artifact creatures you control have "Whenever this creature deals combat damage to a player, you may pay {1}. If you do, create a 1/1 colorless Borg artifact creature token."';

export default defineCard({
  name: "Antagonist Incorporator",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Pay {1} to create a 1/1 Borg token?",
            cost: "{1}",
            effect: { kind: "create-token", token: "Borg Token", count: 1 },
          },
          resolve: null,
          text: "Whenever this creature deals combat damage to a player, you may pay {1}. If you do, create a 1/1 colorless Borg artifact creature token.",
        },
      ],
      text: TEXT,
    },
  ],
});
