import { defineCard } from "../define.js";

// EDHREC rank 13218. Dominaria.
//
// Rulings:
//   [2018-04-27] If a player somehow has only one land card in their graveyard when either of Fall
//     of the Thran's last two chapter abilities resolves, that player returns that one card to the
//     battlefield.
//
// II, III: each player, in turn order, picks two land cards from their own
// graveyard (all of them with two or fewer) and puts them onto the
// battlefield — Sail into the West's per-player `look-and-choose`.

const I_TEXT = "I — Destroy all lands.";
const II_TEXT = "II, III — Each player returns two land cards from their graveyard to the battlefield.";

export default defineCard({
  name: "Fall of the Thran",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "land" } },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          player: "that-player",
          filter: { type: "land" },
          min: 2,
          max: 2,
          destination: "battlefield",
          leftover: "stay",
        },
      },
      resolve: null,
      text: II_TEXT,
    },
  ],
});
