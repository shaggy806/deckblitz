import { defineCard } from "../define.js";

// X is read as the ability resolves. "They gain haste" is an effect, not a copy
// exception, so a copy of one of them has none (rule 707.9).
const TEXT =
  "At the beginning of combat on your turn, create X tokens that are copies of another target creature you control, where X is one plus the number of instant and sorcery spells you've cast this turn. They gain haste. Exile them at the beginning of the next end step.";

export default defineCard({
  name: "Rionya, Fire Dancer",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: { sum: [1, { castThisTurn: { typesAnyOf: ["instant", "sorcery"] } }] },
        who: "you",
        gains: { keywords: ["haste"] },
        exileAtEndStep: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
