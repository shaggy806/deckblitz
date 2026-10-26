import { defineCard } from "../define.js";

// EDHREC rank 24577.
//
// Noncombat damage too (the ruling), from a creature with flying as the
// damage would be dealt.

const TEXT = "{6}, {T}: Prevent all damage that would be dealt to you this turn by creatures with flying.";

export default defineCard({
  name: "Scarecrow",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{6}", tap: true },
      targets: [],
      effect: { kind: "prevent-damage-to-you", by: { type: "creature", keyword: "flying" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
