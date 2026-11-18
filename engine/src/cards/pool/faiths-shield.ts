import { defineCard } from "../define.js";

// EDHREC rank 15065.
//
// Rulings: one color for the player and every permanent alike, chosen as it
// resolves; fateful hour is read then too. The permanent is a target whatever
// your life, and an illegal target means nothing gains protection.

export default defineCard({
  name: "Faith's Shield",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target permanent you control gains protection from the color of your choice until end of turn.\nFateful hour — If you have 5 or less life, instead you and each permanent you control gain protection from the color of your choice until end of turn.",
  targets: [{ kind: "permanent", filter: { controlledBy: "you" } }],
  effect: {
    kind: "conditional",
    condition: { kind: "life-total", who: "you", atMost: 5 },
    then: {
      kind: "grant-protection",
      players: "you",
      filter: { controlledBy: "you" },
      from: { choose: "color" },
      duration: "end-of-turn",
    },
    else: { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
  },
});
