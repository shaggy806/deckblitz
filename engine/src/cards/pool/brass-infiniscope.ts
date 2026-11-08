import { defineCard } from "../define.js";

// A mana ability (rule 605.1a) that also sets up a delayed ability. "X" in
// that ability is the X of the spell that fires it, read as it was cast, as
// a cast trigger's is.
const DELAYED_TEXT =
  "When you next cast a spell with {X} in its mana cost this turn, you draw a card and gain half X life, rounded down.";
const TEXT = `{T}: Add {C}{C}. ${DELAYED_TEXT}`;

export default defineCard({
  name: "Brass Infiniscope",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        also: {
          kind: "delayed-trigger",
          at: { nextSpell: { xInManaCost: true } },
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1 },
              { kind: "gain-life", amount: { half: "x", round: "down" } },
            ],
          },
          text: DELAYED_TEXT,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
