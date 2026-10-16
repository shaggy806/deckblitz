import { defineCard } from "../define.js";

// EDHREC rank 13958.
//
// Rulings:
//   [2024-04-12] The value of X is determined only once, as Tumbleweed Rising resolves. If you
//     don't control any creatures at that time, you'll create a 0/0 Elemental token, which will
//     likely immediately die unless something else is raising its toughness.
//
// The same X/X green Elemental as Dance of the Tumbleweeds', sized by
// `basePt` as it's made (read once); Fungal Sprouting's greatest power.

const MAIN_TEXT =
  "Create an X/X green Elemental creature token, where X is the greatest power among creatures you control.";
const GREATEST = { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Tumbleweed Rising",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  plot: { cost: "{2}{G}" },
  text: `${MAIN_TEXT}\nPlot {2}{G} (You may pay {2}{G} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  effect: {
    kind: "create-token",
    token: "Elemental Token (Dance of the Tumbleweeds)",
    count: 1,
    basePt: { power: GREATEST, toughness: GREATEST },
  },
});
