import { defineCard } from "../define.js";

// EDHREC rank 8536.
// Makes Knight → use "2/2 White Knight Token" (no vigilance).
//
// "Attack", "Ability", "Magic" and "Item" are flavour words on the modes.

export default defineCard({
  name: "Battle Menu",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Attack — Create a 2/2 white Knight creature token.\n" +
    "• Ability — Target creature gets +0/+4 until end of turn.\n" +
    "• Magic — Destroy target creature with power 4 or greater.\n" +
    "• Item — You gain 4 life.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Attack — Create a 2/2 white Knight creature token.",
        targets: [],
        effect: { kind: "create-token", token: "2/2 White Knight Token", count: 1 },
      },
      {
        text: "Ability — Target creature gets +0/+4 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 0, toughness: 4, duration: "end-of-turn" },
      },
      {
        text: "Magic — Destroy target creature with power 4 or greater.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Item — You gain 4 life.",
        targets: [],
        effect: { kind: "gain-life", amount: 4 },
      },
    ],
  },
});
