import { defineCard } from "../define.js";

// EDHREC rank 4648.
//
// "Exile all [creatures except those that share a creature type with a
// creature that convoked this spell], all artifacts, and all enchantments":
// the exception is the creatures' alone, so an artifact or enchantment
// creature that shares a type is still exiled as an artifact or enchantment.
// The convokers are read by their creature types (`typesOf`): one with no
// creature type shares none, not even with itself (rule 205.3m), and each is
// read as it last existed if it has left since it convoked (608.2h). Not
// convoked at all, nothing shares, and every creature goes.

export default defineCard({
  name: "Everything Comes to Dust",
  manaCost: "{7}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  convoke: true,
  text:
    "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n" +
    "Exile all creatures except those that share a creature type with a creature that convoked this spell, all artifacts, and all enchantments.",
  targets: [],
  effect: {
    kind: "exile-all",
    filter: {
      anyOf: [
        { type: "creature", not: { sharesCreatureTypeWith: { typesOf: "convokers" } } },
        { type: "artifact" },
        { type: "enchantment" },
      ],
    },
  },
});
