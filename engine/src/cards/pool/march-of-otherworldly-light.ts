import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty. March of Swirling Mist's cost, with a target that
// reads X: offered once per X the mana and the cards from hand can reach.

const EXILE_TEXT =
  "As an additional cost to cast this spell, you may exile any number of white cards from your hand. This spell costs {2} less to cast for each card exiled this way.";

export default defineCard({
  name: "March of Otherworldly Light",
  manaCost: "{X}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `${EXILE_TEXT}\nExile target artifact, creature, or enchantment with mana value X or less.`,
  additionalCost: { exileFromHandReduces: { filter: { colors: ["W"] }, each: 2 } },
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { typesAnyOf: ["artifact", "creature", "enchantment"], manaValue: { op: "lte", n: "x" } },
    },
  ],
  effect: { kind: "exile", target: 0 },
});
