import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 13603.

export default defineCard({
  name: "Ghoulcaller's Chant",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• Return target creature card from your graveyard to your hand.\n• Return two target Zombie cards from your graveyard to your hand.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Return target creature card from your graveyard to your hand.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      {
        text: "Return two target Zombie cards from your graveyard to your hand.",
        targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { subtype: "Zombie" } }),
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
