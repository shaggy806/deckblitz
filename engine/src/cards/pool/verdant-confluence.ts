import { defineCard } from "../define.js";

// EDHREC rank 11491.

export default defineCard({
  name: "Verdant Confluence",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose three. You may choose the same mode more than once.\n• Put two +1/+1 counters on target creature.\n• Return target permanent card from your graveyard to your hand.\n• Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: "Put two +1/+1 counters on target creature.",
        targets: ["creature"],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      {
        text: "Return target permanent card from your graveyard to your hand.",
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { notTypes: ["instant", "sorcery"] },
          },
        ],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      {
        text: "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
    ],
  },
});
