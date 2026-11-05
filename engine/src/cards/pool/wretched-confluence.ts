import { defineCard } from "../define.js";

// EDHREC rank 12917.

export default defineCard({
  name: "Wretched Confluence",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose three. You may choose the same mode more than once.\n• Target player draws a card and loses 1 life.\n• Target creature gets -2/-2 until end of turn.\n• Return target creature card from your graveyard to your hand.",
  targets: [],
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: "Target player draws a card and loses 1 life.",
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1, target: 0 },
            { kind: "lose-life", amount: 1, target: 0 },
          ],
        },
      },
      {
        text: "Target creature gets -2/-2 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      },
      {
        text: "Return target creature card from your graveyard to your hand.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
    ],
  },
});
