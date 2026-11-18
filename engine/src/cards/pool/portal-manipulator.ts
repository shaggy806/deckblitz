import { defineCard } from "../define.js";

// EDHREC rank 14556.
//
// "Their opponents control" is the creature slots' `differentController`
// from the player in slot 0: with no teams, every other player is an
// opponent (rule 102.3). The creatures are then attacking that player
// (rule 508.7), with no choice: never declared again, so no "attacks"
// trigger, still having attacked what they were declared at, requirements,
// restrictions and costs aside (the rulings). Outside a declare attackers
// step it doesn't trigger.
const TEXT =
  "When this creature enters during the declare attackers step, choose target player and any number of target attacking creatures their opponents control. Those creatures are now attacking that player.";

export default defineCard({
  name: "Portal Manipulator",
  manaCost: "{2}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      whileCondition: { kind: "turn-structure", steps: ["declare-attackers"] },
      targets: [
        "player",
        {
          kind: "any-number",
          of: {
            kind: "other",
            of: { kind: "permanent", filter: { type: "creature", attacking: true } },
            than: { slots: [0] },
            differentController: true,
          },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 1,
        simultaneous: true,
        effect: { kind: "reselect-attack", target: 1, to: { target: 0 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
