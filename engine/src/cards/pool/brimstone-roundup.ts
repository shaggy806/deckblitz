import { defineCard } from "../define.js";

// EDHREC rank 11119. `nthEachTurn` counts every spell cast this turn, the
// ones before this entered included (the ruling: cast as the first spell, the
// next one is the second). The token is the shared OTJ Mercenary.
const CAST_TEXT =
  'Whenever you cast your second spell each turn, create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."';

export default defineCard({
  name: "Brimstone Roundup",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  plot: { cost: "{2}{R}" },
  text: `${CAST_TEXT}\nPlot {2}{R} (You may pay {2}{R} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
