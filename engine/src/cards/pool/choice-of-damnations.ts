import { defineCard } from "../define.js";

// The target opponent's number is an open `vote` of one, kept for the steps
// after it. "Sacrifices all but that many": they keep that many, and with no
// more than that they sacrifice nothing (the ruling).
export default defineCard({
  name: "Choice of Damnations",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text:
    "Target opponent chooses a number. You may have that player lose that much life. " +
    "If you don't, that player sacrifices all but that many permanents of their choice.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, who: { target: 0 }, for: { number: {} } },
      {
        kind: "may",
        prompt: "Have that player lose that much life? If you don't, they sacrifice all but that many permanents.",
        effect: { kind: "lose-life", amount: { votedNumber: 0 }, who: { target: 0 } },
        else: { kind: "sacrifice-all-but", who: { target: 0 }, keep: { votedNumber: 0 }, filter: {} },
      },
    ],
  },
});
