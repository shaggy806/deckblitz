import { defineCard } from "../define.js";

export default defineCard({
  name: "Mishra's Command",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Choose two —\n" +
    "• Choose target player. They may discard up to X cards. Then they draw a card for each card discarded this way.\n" +
    "• This spell deals X damage to target creature.\n" +
    "• This spell deals X damage to target planeswalker.\n" +
    "• Target creature gets +X/+0 and gains haste until end of turn.",
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Choose target player. They may discard up to X cards. Then they draw a card for each card discarded this way.",
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: 0, amount: 0, anyNumber: true, atMost: "x" },
            { kind: "draw", target: 0, amount: { thisWay: "discarded" } },
          ],
        },
      },
      {
        text: "This spell deals X damage to target creature.",
        targets: ["creature"],
        effect: { kind: "damage", amount: "x", target: 0 },
      },
      {
        text: "This spell deals X damage to target planeswalker.",
        targets: [{ kind: "permanent", filter: { type: "planeswalker" } }],
        effect: { kind: "damage", amount: "x", target: 0 },
      },
      {
        text: "Target creature gets +X/+0 and gains haste until end of turn.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
