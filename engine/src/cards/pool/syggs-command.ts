import { defineCard } from "../define.js";

export default defineCard({
  name: "Sygg's Command",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["kindred", "sorcery"],
  subtypes: ["Merfolk"],
  text: "Choose two —\n• Create a token that's a copy of target Merfolk you control.\n• Creatures target player controls gain lifelink until end of turn.\n• Target player draws a card.\n• Tap target creature. Put a stun counter on it.",
  targets: [],
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Create a token that's a copy of target Merfolk you control.",
        targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Merfolk" } }],
        effect: { kind: "create-token-copy", of: 0, count: 1 },
      },
      {
        text: "Creatures target player controls gain lifelink until end of turn.",
        targets: ["player"],
        effect: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          controlledByTarget: 0,
          keyword: "lifelink",
          duration: "end-of-turn",
        },
      },
      {
        text: "Target player draws a card.",
        targets: ["player"],
        effect: { kind: "draw", amount: 1, target: 0 },
      },
      {
        text: "Tap target creature. Put a stun counter on it.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          ],
        },
      },
    ],
  },
});
