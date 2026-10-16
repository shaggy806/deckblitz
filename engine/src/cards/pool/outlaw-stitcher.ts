import { defineCard } from "../define.js";

// EDHREC rank 19653. "Two +1/+1 counters for each spell you've cast this turn
// other than the first": twice (spells cast − 1), never below 0 — every spell
// counts, this one included if it wasn't the first, countered or still on the
// stack (the ruling). The counters go on the token once it has entered
// (`thenCounters`), on each token if a replacement made more than one.
const ENTER_TEXT =
  "When this creature enters, create a 2/2 blue and black Zombie Rogue creature token, then put two +1/+1 counters on that token for each spell you've cast this turn other than the first.";

export default defineCard({
  name: "Outlaw Stitcher",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 1,
  toughness: 4,
  plot: { cost: "{4}{U}" },
  text: `${ENTER_TEXT}\nPlot {4}{U} (You may pay {4}{U} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Zombie Rogue Token",
        count: 1,
        thenCounters: {
          kind: "+1/+1",
          amount: { product: [2, { difference: [{ turnStat: "spells-cast" }, 1] }] },
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
