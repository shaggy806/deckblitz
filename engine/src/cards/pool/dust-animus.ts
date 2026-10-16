import { defineCard, type StaticAbility } from "../define.js";
import type { EffectAmount } from "../../effects.js";

// EDHREC rank 13493. One replacement putting two kinds of counter on, as two
// enters-with statics read at the same moment. "If you control five or more
// untapped lands" is read as it enters, before it or anything entering with it
// is there (rule 614.12) — which an enters-with amount's condition leaves out.
const ENTER_TEXT =
  "If you control five or more untapped lands, this creature enters with two +1/+1 counters and a lifelink counter on it.";

const ONE_IF_FIVE: EffectAmount = {
  ifCondition: { kind: "controls", filter: { type: "land", controlledBy: "you", tapped: false }, atLeast: 5 },
  then: 1,
  else: 0,
};

const entersWith = (kind: string, amount: EffectAmount): StaticAbility => ({
  affects: { scope: "self" },
  replacement: { event: "enters-battlefield", counters: { kind, amount } },
  text: ENTER_TEXT,
});

export default defineCard({
  name: "Dust Animus",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  plot: { cost: "{1}{W}" },
  text: `Flying\n${ENTER_TEXT}\nPlot {1}{W} (You may pay {1}{W} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  static: [entersWith("+1/+1", { product: [2, ONE_IF_FIVE] }), entersWith("lifelink", ONE_IF_FIVE)],
});
