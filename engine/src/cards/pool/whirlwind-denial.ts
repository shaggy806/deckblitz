import { defineCard } from "../define.js";

// Commander 2019 (C19).
//
// Nothing is targeted. Each opponent, starting with the one whose turn it is
// (or the next in turn order), decides for their own spells and abilities —
// activated and triggered, never mana abilities, which don't use the stack —
// and pays as they go; then every one not paid for is countered at the same
// time (the rulings).
const TEXT = "For each spell and ability your opponents control, counter it unless its controller pays {4}.";

export default defineCard({
  name: "Whirlwind Denial",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "for-each-unless",
    of: { stack: { spells: true, abilities: true, whose: "opponent" } },
    asks: "controller",
    options: [{ pay: "{4}", text: "Pay {4} for {it}" }],
    otherwise: { kind: "counter", target: 0, atRelease: true },
  },
});
