import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever this creature attacks, gain control of target permanent you own but don't control.";
const FACE_UP_TEXT =
  "When this creature is turned face up, target opponent gains control of any number of target permanents you control. Draw a card for each one they gained control of this way.";

export default defineCard({
  name: "Coveted Falcon",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\nDisguise {1}{U}\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{1}{U}" },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { ownedBy: "you" } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["opponent", { kind: "any-number", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 1,
            simultaneous: true,
            effect: { kind: "gain-control", target: 1, untilEndOfTurn: false, who: { target: 0 } },
          },
          { kind: "draw", amount: { thisWay: "gained-control" } },
        ],
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
