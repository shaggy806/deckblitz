import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty. The cost's cards are named as it's cast, each {2} off
// the generic part, X's included, never the {U}, though any number may go; its
// mana value stays X plus 1 whatever was paid (the rulings).

const EXILE_TEXT =
  "As an additional cost to cast this spell, you may exile any number of blue cards from your hand. This spell costs {2} less to cast for each card exiled this way.";

export default defineCard({
  name: "March of Swirling Mist",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${EXILE_TEXT}\nUp to X target creatures phase out. (While they're phased out, they're treated as though they don't exist. Each one phases in before its controller untaps during their next untap step.)`,
  additionalCost: { exileFromHandReduces: { filter: { colors: ["U"] }, each: 2 } },
  targets: [{ kind: "any-number", of: "creature", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "phase-out", target: 0 },
  },
});
