import { defineCard } from "../define.js";

// EDHREC rank 17496.
//
// Rulings:
//   [2026-01-27] You don't choose a target creature an opponent controls for Novel Nunchaku's
//     first ability at the time it triggers. Rather, a second "reflexive" ability triggers when
//     Novel Nunchaku is attached to the target creature you control this way. You choose a target
//     for that ability as it goes on the stack. Each player may respond to this triggered ability
//     as normal.
//
// "When you do" (rule 603.12) is a reflexive trigger set up only once the
// attach has happened — the Equipment is attached to a creature as the
// enters ability finishes; it targets as it goes on the stack.

const ENTERS =
  "When this Equipment enters, attach it to target creature you control. When you do, equipped creature fights up to one target creature an opponent controls. (Each deals damage equal to its power to the other.)";

export default defineCard({
  name: "Novel Nunchaku",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\nEquipped creature gets +1/+1 and has trample.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attach", target: 0, attachment: "source" },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
              effect: { kind: "fight", a: "attached", b: 0 },
              text: "When you do, equipped creature fights up to one target creature an opponent controls.",
            },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +1/+1 and has trample.",
    },
  ],
});
