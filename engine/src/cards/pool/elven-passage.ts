import { defineCard } from "../define.js";

// EDHREC rank 8034.
//
// Fabled Passage's search, then "you may behold an Elf" (rule 701.4a — an
// Elf card from the hand or an Elf you control), not offered with none.
// "That land" is the one this ability put onto the battlefield — the
// `thisWay` clause, read off this resolution's own events.

const TEXT =
  "{T}, Pay 1 life, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. You may behold an Elf. If you do, untap that land.";

export default defineCard({
  name: "Elven Passage",
  types: ["land"],
  text: `${TEXT} (To behold an Elf, choose an Elf you control or reveal an Elf card from your hand.)`,
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 1, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { type: "land", supertype: "basic" },
            destination: "battlefield",
            min: 0,
            max: 1,
            enterTapped: true,
          },
          {
            kind: "may",
            prompt: "Behold an Elf to untap that land?",
            effect: { kind: "behold", filter: { subtype: "Elf" }, text: "an Elf" },
            then: { kind: "untap-all", filter: { type: "land", thisWay: "put-onto-battlefield" } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
