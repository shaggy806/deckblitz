import { defineCard } from "../define.js";

// EDHREC rank 12929.
// Makes Jace → use "Jace Token".

export default defineCard({
  name: "Fatehold Charm",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Choose one —\n• Draw a card. Empower Jace 2.\n• Return target spell or creature to its owner's hand.\n• Creatures you control get +1/+2 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Draw a card. Empower Jace 2.",
        effect: {
          kind: "sequence",
          effects: [{ kind: "draw", amount: 1 }, { kind: "empower-jace", amount: 2 }],
        },
      },
      {
        text: "Return target spell or creature to its owner's hand.",
        targets: [{ kind: "one-of", of: ["spell", "creature"] }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "return-to-hand", target: 0, from: "stack" },
            { kind: "return-to-hand", target: 0 },
          ],
        },
      },
      {
        text: "Creatures you control get +1/+2 until end of turn.",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 2,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
