import { defineCard } from "../define.js";

// EDHREC rank 18268.
//
// Banishing Light's O-Ring (rule 610.3: nothing is exiled once the
// enchantment has left — the ruling), with an optional target and 2 life on
// top. With no target chosen the ability still resolves and the life is
// gained; a target that has become illegal fizzles the whole ability (rule
// 608.2b), as the ruling's "if that permanent remains a legal target" says.

const ENTER_TEXT =
  "When this enchantment enters, exile up to one target nonland permanent an opponent controls until this enchantment leaves the battlefield. You gain 2 life.";

export default defineCard({
  name: "Liminal Hold",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "nonland-permanent-an-opponent-controls" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
