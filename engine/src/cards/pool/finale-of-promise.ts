import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const TEXT =
  "You may cast up to one target instant card and/or up to one target sorcery card from your graveyard each with " +
  "mana value X or less without paying their mana costs. If a spell cast this way would be put into your " +
  "graveyard, exile it instead. If X is 10 or more, copy each of those spells twice. You may choose new targets " +
  "for the copies.";

// The rulings this follows: the cards are cast one at a time as this
// resolves, in either order, each a "may" of its own, their X 0 and no
// alternative cost; then, with X 10 or more, each spell cast this way is
// copied twice, the copies put on the stack in the order you choose (they
// resolve before the originals) and never cast. A copy keeps the original's
// modes and division. A spell cast this way is exiled rather than put into
// your graveyard, countered or not.
const upToOne = (type: "instant" | "sorcery"): TargetSpec => ({
  kind: "optional",
  of: { kind: "card-in-graveyard", whose: "you", filter: { type, manaValue: { op: "lte", n: "x" } } },
});

export default defineCard({
  name: "Finale of Promise",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [upToOne("instant"), upToOne("sorcery")],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "cast-now", from: "targets", repeat: true, free: true, exileAfter: true },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 10 } },
        then: { kind: "copy-all", what: "spells", of: { thisWay: "cast" }, times: 2, newTargets: true },
      },
    ],
  },
});
