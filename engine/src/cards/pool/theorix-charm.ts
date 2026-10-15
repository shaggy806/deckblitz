import { defineCard } from "../define.js";

// EDHREC rank 21809.

export default defineCard({
  name: "Theorix Charm",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Choose one —\n• Counter target noncreature spell unless its controller pays {2}.\n• Target creature gets -2/-2 until end of turn.\n• Mill three cards, then draw a card. (To mill three cards, put the top three cards of your library into your graveyard.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target noncreature spell unless its controller pays {2}.",
        targets: ["noncreature-spell"],
        effect: {
          kind: "unless",
          chooser: 0,
          options: [{ pay: "{2}", text: "Pay {2}" }],
          otherwise: { kind: "counter", target: 0 },
        },
      },
      {
        text: "Target creature gets -2/-2 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      },
      {
        text: "Mill three cards, then draw a card.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "mill", target: "you", amount: 3 },
            { kind: "draw", amount: 1 },
          ],
        },
      },
    ],
  },
});
