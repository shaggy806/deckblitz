import { defineCard } from "../define.js";

// The two anthems stack on a white-and-black creature (+2/+2 — the ruling).
// The destroy trigger targets any creature and checks it's tapped as it
// resolves (the ruling).
const WHITE_TEXT = "Whenever you cast a white spell, you may tap target creature.";
const BLACK_TEXT = "Whenever you cast a black spell, you may destroy target creature if it's tapped.";

export default defineCard({
  name: "Deathbringer Liege",
  manaCost: "{2}{W/B}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 4,
  text: `Other white creatures you control get +1/+1.\nOther black creatures you control get +1/+1.\n${WHITE_TEXT}\n${BLACK_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other white creatures you control get +1/+1.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other black creatures you control get +1/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"] } },
      targets: ["creature"],
      effect: { kind: "may", prompt: "Tap the targeted creature?", effect: { kind: "tap", target: 0 } },
      resolve: null,
      text: WHITE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B"] } },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { tapped: true } },
        then: { kind: "may", prompt: "Destroy the targeted tapped creature?", effect: { kind: "destroy", target: 0 } },
      },
      resolve: null,
      text: BLACK_TEXT,
    },
  ],
});
