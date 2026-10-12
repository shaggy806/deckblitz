import { defineCard } from "../define.js";

export default defineCard({
  name: "Invisible Force Field",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  rebound: true,
  text:
    "Up to four target permanents you control gain indestructible until end of turn.\n" +
    "Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: [{ kind: "any-number", of: { kind: "permanent", whose: "you", filter: {} }, max: 4 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
  },
});
