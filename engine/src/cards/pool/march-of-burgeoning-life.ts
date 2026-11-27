import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty. March of Otherworldly Light's cost and X-read
// target, then a library search for the target's name: the filter's
// `sameNameWith: 0` reads the target as it is at resolution (or as it last
// existed, 608.2h). The spell's only target, so with it gone the spell does
// nothing (608.2b).

const EXILE_TEXT =
  "As an additional cost to cast this spell, you may exile any number of green cards from your hand. This spell costs {2} less to cast for each card exiled this way.";

export default defineCard({
  name: "March of Burgeoning Life",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `${EXILE_TEXT}\nChoose target creature with mana value less than X. Search your library for a creature card with the same name as that creature, put it onto the battlefield tapped, then shuffle.`,
  additionalCost: { exileFromHandReduces: { filter: { colors: ["G"] }, each: 2 } },
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { type: "creature", manaValue: { op: "lt", n: "x" } },
    },
  ],
  effect: {
    kind: "search-library",
    filter: { type: "creature", sameNameWith: 0 },
    destination: "battlefield",
    enterTapped: true,
    min: 0,
    max: 1,
  },
});
