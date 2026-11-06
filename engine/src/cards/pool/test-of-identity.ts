import { defineCard } from "../define.js";

// EDHREC rank 32358.

const KLINGON_TEXT = "I Am Klingon — Target Klingon gets +1/+1 and gains double strike until end of turn.";
const STARFLEET_TEXT = "I Am Starfleet — Discard a card. If you do, draw two cards.";

export default defineCard({
  name: "Test of Identity",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${KLINGON_TEXT}\n• ${STARFLEET_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: KLINGON_TEXT,
        targets: [{ kind: "permanent", filter: { subtype: "Klingon" } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: STARFLEET_TEXT,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 2 },
            },
          ],
        },
      },
    ],
  },
});
