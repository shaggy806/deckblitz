import { defineCard } from "../define.js";

// Life lost, not net life change (the ruling). The sacrificed creature's
// power and toughness are as it last existed (the ruling).

const PT_TEXT = "Greven gets +X/+0, where X is the amount of life you've lost this turn.";
const ATTACK_TEXT =
  "Whenever Greven attacks, you may sacrifice another creature. If you do, you draw cards equal to that creature's power and you lose life equal to that creature's toughness.";

export default defineCard({
  name: "Greven, Predator Captain",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["menace"],
  text: `Menace\n${PT_TEXT}\n${ATTACK_TEXT}`,
  static: [{ affects: { scope: "self" }, grantPtPerCount: { turnStat: "life-lost", pt: [1, 0] }, text: PT_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: { powerOf: "sacrificed" } },
            { kind: "lose-life", amount: { toughnessOf: "sacrificed" } },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
