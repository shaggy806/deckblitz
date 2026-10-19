import { defineCard } from "../define.js";

// EDHREC rank 7444.
//
// I counts the opponents you have as it resolves (`countPlayers`); III
// compares creature counts as it resolves (Voice of Many's
// `opponentsControllingFewer`), two cards for each such opponent. Its filter's
// `controlledBy: "you"` is what makes each player's count their own: the
// amount reads the filter once from your side and once from each opponent's.
const CH1 = "I — Create a 2/2 white Astartes Warrior creature token with vigilance for each opponent you have.";
const CH2 = "II — Each opponent sacrifices a creature of their choice.";
const CH3 = "III — Draw two cards for each opponent who controls fewer creatures than you.";

export default defineCard({
  name: "Birth of the Imperium",
  manaCost: "{2}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CH1}\n${CH2}\n${CH3}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Astartes Warrior Token", count: { countPlayers: "each-opponent" } },
      resolve: null,
      text: CH1,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: CH2,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "draw",
        amount: { product: [2, { opponentsControllingFewer: { type: "creature", controlledBy: "you" } }] },
      },
      resolve: null,
      text: CH3,
    },
  ],
});
