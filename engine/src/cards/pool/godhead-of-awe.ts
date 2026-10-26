import { defineCard } from "../define.js";

// EDHREC rank 20782.
//
// Rulings:
//   [2008-05-01] This doesn't cause creatures to lose their abilities.
//   [2008-05-01] If two Godheads of Awe are on the battlefield, they'll each make the other one
//     1/1.
//   [2009-10-01] Godhead of Awe's ability overwrites other effects that set a creature's power and
//     toughness to specific values only if those effects existed before the Godhead entered. It
//     will not overwrite effects that modify power or toughness, nor effects that set power and
//     toughness which come into existence after the Godhead enters.
//
// Kudo's shape: a layer-7b base P/T set on every other creature, whoever
// controls it, ordered by timestamp among the other 7b effects; counters and
// pumps still apply on top (7c).

const TEXT = "Other creatures have base power and toughness 1/1.";

export default defineCard({
  name: "Godhead of Awe",
  manaCost: "{W/U}{W/U}{W/U}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" }, excludeSelf: true },
      setBasePt: { power: 1, toughness: 1 },
      text: TEXT,
    },
  ],
});
