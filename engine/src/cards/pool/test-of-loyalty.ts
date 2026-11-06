import { defineCard } from "../define.js";

// EDHREC rank 29161.

export default defineCard({
  name: "Test of Loyalty",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• Plain, Simple Garak — Exile target card from a graveyard. Draw a card.\n• Of the Obsidian Order — Return target creature card from your graveyard to your hand.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Plain, Simple Garak — Exile target card from a graveyard. Draw a card.",
        targets: [{ kind: "card-in-graveyard", whose: "any" }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            { kind: "draw", amount: 1 },
          ],
        },
      },
      {
        text: "Of the Obsidian Order — Return target creature card from your graveyard to your hand.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
    ],
  },
});
