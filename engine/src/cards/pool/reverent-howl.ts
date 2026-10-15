import { defineCard } from "../define.js";

// EDHREC rank 16696.

export default defineCard({
  name: "Reverent Howl",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Target player draws two cards and loses 2 life.\n• Target creature gets +2/+2 and gains lifelink until end of turn.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target player draws two cards and loses 2 life.",
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 2, target: 0 },
            { kind: "lose-life", amount: 2, target: 0 },
          ],
        },
      },
      {
        text: "Target creature gets +2/+2 and gains lifelink until end of turn.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
