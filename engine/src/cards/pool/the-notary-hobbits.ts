import { defineCard } from "../define.js";

// EDHREC rank 10637.
//
// Gruff Triplets' "if it isn't a token, create two tokens that are copies of
// it", with Helm of the Host's `notLegendary` copy exception (a copiable
// value, so a copy of a token copy isn't legendary either). Read as the
// Hobbits last existed if they've left (rule 608.2h). The mana counts every
// Halfling you control as the ability resolves, the tokens and the Hobbits
// themselves included.

const COPY_TEXT =
  "When The Notary Hobbits enter, if they're not a token, create two tokens that are copies of them, except the tokens aren't legendary.";
const MANA_TEXT = "{T}: Add {C} for each Halfling you control.";

export default defineCard({
  name: "The Notary Hobbits",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Advisor"],
  power: 1,
  toughness: 1,
  text: `${COPY_TEXT}\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { token: false } },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 2, who: "you", notLegendary: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: { countOf: { subtype: "Halfling", controlledBy: "you" } } },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
