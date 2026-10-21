import { defineCard } from "../define.js";

// EDHREC rank 22458. Throne of Eldraine.
//
// Rulings:
//   [2019-10-04] The triggered ability that copies Banish into Fable resolves and creates copies
//     of Banish into Fable even if Banish into Fable is countered. The ability and the copies
//     resolve before Banish into Fable itself resolves.
//   [2019-10-04] If the target nonland permanent is an illegal target by the time Banish into
//     Fable tries to resolve, the spell won't resolve. You won't create a Knight token.
//   [2019-10-04] If you control one permanent that's an artifact and an enchantment, you'll copy
//     Banish into Fable twice.
//   [2019-10-04] Whether you control an artifact and/or an enchantment is checked only as the
//     triggered ability resolves.
//
// "From your hand" is part of the trigger condition (rule 603.1): a
// `whileCondition` on the spell's own `castFrom`, asked only as it's cast.
// Each copy is checked as the trigger resolves, and `"trigger-spell"` copies
// the spell as it last was on the stack if it was countered in response.

const CAST_TEXT =
  "When you cast this spell from your hand, copy it if you control an artifact, then copy it if you control an enchantment. You may choose new targets for the copies.";
const SPELL_TEXT =
  "Return target nonland permanent to its owner's hand. You create a 2/2 white Knight creature token with vigilance.";

export default defineCard({
  name: "Banish into Fable",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: `${CAST_TEXT}\n${SPELL_TEXT}`,
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "create-token", token: "Knight Token", count: 1 },
    ],
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      whileCondition: { kind: "source", filter: { castFrom: "hand" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
            then: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
          },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
            then: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
          },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
