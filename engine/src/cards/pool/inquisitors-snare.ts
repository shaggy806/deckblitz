import { defineCard } from "../define.js";

// EDHREC rank 28070.
//
// The prevention follows the creature even after it leaves the battlefield (the
// ruling): a `damage-rule` asks as the damage would be dealt.

export default defineCard({
  name: "Inquisitor's Snare",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage target attacking or blocking creature would deal this turn. If that creature is black or red, destroy it.",
  targets: ["attacking-or-blocking-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-rule", by: { target: 0 } },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] } },
        then: { kind: "destroy", target: 0 },
      },
    ],
  },
});
