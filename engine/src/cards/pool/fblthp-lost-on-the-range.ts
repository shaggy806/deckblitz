import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// Outlaws of Thunder Junction (OTJ).
//
// Plot (rule 702.170a) is a special action (116.2k): exile the card from the
// top of the library paying a plot cost, during your main phase with the
// stack empty; it's cast free on a later turn (702.170d). The top card has
// plot for its mana cost, beside any plot cost of its own — either may be
// used (the rulings) — and a hand's "plotting costs less" doesn't reach it.
// A land has plot but can't be plotted from there ("nonland"); a card with no
// mana cost gets no plot cost from this.
const LOOK_TEXT = "You may look at the top card of your library any time.";
const HAS_PLOT_TEXT = "The top card of your library has plot. The plot cost is equal to its mana cost.";
const PLOT_TEXT = "You may plot nonland cards from the top of your library.";

export default defineCard({
  name: "Fblthp, Lost on the Range",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 1,
  text: `Ward {2}\n${LOOK_TEXT}\n${HAS_PLOT_TEXT}\n${PLOT_TEXT}`,
  looksAtOwnLibraryTop: true,
  triggered: [ward({ mana: "{2}" })],
  static: [
    {
      affects: { scope: "self" },
      grantsToLibraryTop: { filter: {}, keywordValues: [{ keyword: "plot", cost: "mana-cost" }] },
      text: HAS_PLOT_TEXT,
    },
    { affects: { scope: "self" }, plotsFromLibraryTop: { filter: { notTypes: ["land"] } }, text: PLOT_TEXT },
  ],
});
