import { defineCard } from "../define.js";

// A static's `controls` condition leaves this creature out ("another"); a
// Wolf and a Werewolf together still give only +1/+0 (the ruling).
const TEXT = "As long as you control another Wolf or Werewolf, this creature gets +1/+0 and has trample.";

export default defineCard({
  name: "Hungry Ridgewolf",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtypes: ["Wolf", "Werewolf"] }, atLeast: 1 },
      grantPt: [1, 0],
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
