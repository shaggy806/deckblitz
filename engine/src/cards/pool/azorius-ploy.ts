import { defineCard } from "../define.js";

// EDHREC rank 27028.
//
// Two targets, which may be the same creature (the ruling): one rule on what
// the first would deal, one on what the second would be dealt.

export default defineCard({
  name: "Azorius Ploy",
  manaCost: "{1}{W}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Prevent all combat damage target creature would deal this turn.\nPrevent all combat damage that would be dealt to target creature this turn.",
  targets: ["creature", "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-rule", by: { target: 0 }, combat: true },
      { kind: "damage-rule", to: { target: 1 }, combat: true },
    ],
  },
});
