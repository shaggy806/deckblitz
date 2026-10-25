import { defineCard } from "../define.js";

// EDHREC rank 14889. Lieutenant (C14) — Tyrant's Familiar's shape: one static,
// gated on controlling your own commander, that grants both the +2/+2 and the
// triggered ability. A trigger already on the stack resolves even if the
// commander leaves in response (the ruling) — it's a triggered ability in its
// own right once it triggers.

const LIEUTENANT_TEXT =
  'Lieutenant — As long as you control your commander, this creature gets +2/+2 and has "Whenever this creature deals combat damage to a player, that player sacrifices a creature of their choice."';

export default defineCard({
  name: "Demon of Wailing Agonies",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${LIEUTENANT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "controls",
        filter: { isCommander: true, controlledBy: "you", ownedBy: "you" },
        atLeast: 1,
      },
      grantPt: [2, 2],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "sacrifice", who: "trigger-player", filter: { type: "creature" }, count: 1 },
          resolve: null,
          text: "Whenever this creature deals combat damage to a player, that player sacrifices a creature of their choice.",
        },
      ],
      text: LIEUTENANT_TEXT,
    },
  ],
});
