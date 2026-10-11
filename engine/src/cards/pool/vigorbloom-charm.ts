import { defineCard } from "../define.js";

export default defineCard({
  name: "Vigorbloom Charm",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Choose one —\n• Target permanent you control gains hexproof and indestructible until end of turn.\n• You draw a card and gain 3 life.\n• Put a +1/+1 counter on target creature you control. Then it fights target creature an opponent controls. (Each deals damage equal to its power to the other.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target permanent you control gains hexproof and indestructible until end of turn.",
        targets: [{ kind: "permanent", whose: "you", filter: {} }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: "You draw a card and gain 3 life.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "gain-life", amount: 3 },
          ],
        },
      },
      {
        // Ancient Animus's shape, the counter unconditional.
        text: "Put a +1/+1 counter on target creature you control. Then it fights target creature an opponent controls.",
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "fight", a: 0, b: 1 },
          ],
        },
      },
    ],
  },
});
