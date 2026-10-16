import { defineCard } from "../define.js";

// EDHREC rank 21857. "If it wasn't cast or no mana was spent to cast it" is
// one test: the mana spent to cast it is 0 (`manaSpent` reads 0 for something
// that wasn't cast). A free cast that still paid mana for an additional cost
// or a cost increase spent some, so no counters (the ruling).
const ENTER_TEXT =
  "This creature enters with two +1/+1 counters on it if it wasn't cast or no mana was spent to cast it.";

export default defineCard({
  name: "Freestrider Commando",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Mercenary"],
  power: 3,
  toughness: 3,
  plot: { cost: "{3}{G}" },
  text: `${ENTER_TEXT}\nPlot {3}{G} (You may pay {3}{G} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "source", filter: { manaSpent: { op: "eq", n: 0 } } },
            then: 2,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});
