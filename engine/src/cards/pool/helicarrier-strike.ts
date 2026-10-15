import { defineCard } from "../define.js";

// EDHREC rank 23444. Teamwork 2 (rule 702.194): "if this spell was cast using
// teamwork" is the spell being kicked, whose effect deals 4 instead of 2
// (Team Tactics' shape).
export default defineCard({
  name: "Helicarrier Strike",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: {
    cost: "",
    keyword: "teamwork",
    teamwork: 2,
    effect: { kind: "damage", amount: 4, target: 0 },
  },
  text:
    "Teamwork 2 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 2 or more.)\n" +
    "Helicarrier Strike deals 2 damage to target attacking or blocking creature. If this spell was cast using teamwork, it deals 4 damage to that creature instead.",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "damage", amount: 2, target: 0 },
});
