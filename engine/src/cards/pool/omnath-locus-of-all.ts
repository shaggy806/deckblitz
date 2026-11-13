import { defineCard } from "../define.js";

const LOSE_TEXT = "If you would lose unspent mana, that mana becomes black instead.";
const MAIN_TEXT =
  "At the beginning of your first main phase, look at the top card of your library. You may reveal that card if it has three or more colored mana symbols in its mana cost. If you do, add three mana in any combination of its colors and put it into your hand. If you don't reveal it, put it into your hand.";

// Top-500 commander (rank 149). Kruphix's replacement, black: the mana stays
// from step to step with its restrictions and riders (the rulings). The main-
// phase trigger isn't a mana ability (its ruling, rule 605.5a) — it uses the
// stack. The first main phase is the precombat one (rule 505.1a). Only a card
// with three or more coloured symbols may be revealed — hybrid and Phyrexian
// ones count (rule 107.4e–f, the ruling's {R/G}{G}{G/W}) — and the mana is any
// combination of that card's colours, its `then` reading the card it chose.
// Revealed or not, the card goes to your hand.
export default defineCard({
  name: "Omnath, Locus of All",
  manaCost: "{W}{U}{B/P}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elemental"],
  power: 4,
  toughness: 4,
  text: `${LOSE_TEXT}\n${MAIN_TEXT}`,
  static: [{ affects: { scope: "self" }, unspentManaBecomes: "B", text: LOSE_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { coloredManaSymbols: { op: "gte", n: 3 } },
        destination: "hand",
        leftover: "hand",
        then: { kind: "add-mana", mana: { colorsOfTarget: 0 }, amount: 3 },
      },
      resolve: null,
      text: MAIN_TEXT,
    },
  ],
});
