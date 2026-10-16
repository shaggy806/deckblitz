import { defineCard } from "../define.js";

// EDHREC rank 7904.
//
// Rulings:
//   [2024-07-05] You can't try to attach an Equipment to the target creature if that Equipment
//     can't legally be attached to it.

export default defineCard({
  name: "Battlefield Improvisation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If that creature is attacking, you may attach any number of Equipment you control to it.",
  targets: ["creature"],
  // Any creature, anyone's: Equipment you control may equip it (rule
  // 301.5d). One that can't legally equip it doesn't move (701.3b).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { attacking: true } },
        then: {
          kind: "attach",
          target: 0,
          choose: {
            filter: { subtype: "Equipment", controlledBy: "you" },
            prompt: "Attach any number of Equipment you control to it",
          },
        },
      },
    ],
  },
});
