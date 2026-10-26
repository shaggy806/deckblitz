import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 15729.
//
// Depala's "as long as it's a creature": every permanent that is both a land
// and a creature (layer 4) gets the bonus; it animates nothing (the ruling).
//
// Rulings:
//   [2006-02-01] Earth Surge gives the bonus to each permanent that has both the "land" and
//     "creature" types. It doesn't turn lands into creatures.

const TEXT = "Each land gets +2/+2 as long as it's a creature.";

export default defineCard({
  name: "Earth Surge",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["land", "creature"] } },
      grantPt: [2, 2],
      text: TEXT,
    },
  ],
});
