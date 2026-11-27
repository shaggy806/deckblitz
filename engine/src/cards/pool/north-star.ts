import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 32143.
//
// A timed static for the turn (`spendManaAs.oneSpell`): only a spell's
// payment, only its mana cost's symbols (rule 609.4b), and used up by the
// first spell cast this turn that can't be paid without it. Activated twice,
// it's two spells.

const RULE = "For one spell this turn, you may spend mana as though it were mana of any type to pay that spell's mana cost.";
const TEXT = `{4}, {T}: ${RULE}`;

export default defineCard({
  name: "North Star",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (Additional costs are still paid normally.)`,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "timed-static",
        duration: "end-of-turn",
        text: RULE,
        static: [{ affects: { scope: "self" }, spendManaAs: { as: "any-type", oneSpell: true }, text: RULE }],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
