import { defineCard } from "../define.js";

// Its cost moves a card from a library, so the ability isn't a mana ability
// (rule 605.1a): it uses the stack, as "activate only as an instant" says, and
// can't be activated while paying a cost. The milled card's mana cost is read
// as the ability resolves; a hybrid symbol is coloured (107.4) and gives one
// of its colours, its controller's choice (608.2d), a Phyrexian symbol its
// colour, and generic, {C} and {X} nothing.

const TEXT =
  "{T}, Mill a card: For each colored mana symbol in the milled card's mana cost, add one mana of that color. (Activate only as an instant. For example, if the card's mana cost is {3}{U}{U}{B}, you add {U}{U}{B}.)";

export default defineCard({
  name: "Charmed Pendant",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, do: { kind: "mill", target: "you", amount: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: { manaCostOf: { paid: "milled" }, coloredSymbols: true }, amount: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
