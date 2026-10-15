import { defineCard } from "../define.js";

// EDHREC rank 14124. Fight On!'s "up to two target … cards", over permanent
// cards (not instants or sorceries).

const PERMANENT_CARD = { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } } as const;

export default defineCard({
  name: "Rydia's Return",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose one —\n• Creatures you control get +3/+3 until end of turn.\n• Return up to two target permanent cards from your graveyard to your hand.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Creatures you control get +3/+3 until end of turn.",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 3,
          toughness: 3,
          duration: "end-of-turn",
        },
      },
      {
        text: "Return up to two target permanent cards from your graveyard to your hand.",
        targets: [
          { kind: "optional", of: PERMANENT_CARD },
          { kind: "optional", of: { kind: "other", of: PERMANENT_CARD, than: { slots: [0] } } },
        ],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: 0, from: "graveyard" },
            { kind: "return-to-hand", target: 1, from: "graveyard" },
          ],
        },
      },
    ],
  },
});
