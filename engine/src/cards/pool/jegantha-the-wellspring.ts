import { defineCard } from "../define.js";

// - Its mana is `notGeneric`: each unit pays only a pip of its own colour,
//   a hybrid pip's coloured half included, never generic mana or {X} (its
//   rulings). The auto-payer leaves it alone: tap it by hand, and the
//   floating mana pays the coloured pips it can.
// - The companion condition is `noRepeatedManaSymbol`: `{X}{X}{R}` and
//   `{R/G}{R/G}` both repeat a symbol (its rulings).

const COMPANION =
  "Companion — No card in your starting deck has more than one of the same mana symbol in its mana cost. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)";
const MANA = "{T}: Add {W}{U}{B}{R}{G}. This mana can't be spent to pay generic mana costs.";

export default defineCard({
  name: "Jegantha, the Wellspring",
  manaCost: "{4}{R/G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Elk"],
  power: 5,
  toughness: 5,
  text: `${COMPANION}\n${MANA}`,
  companion: { kind: "each-card", of: "card", test: { noRepeatedManaSymbol: true } },
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["W", "U", "B", "R", "G"] }, amount: 1, notGeneric: true },
      resolve: null,
      text: MANA,
    },
  ],
});
