import { defineCard } from "../define.js";

// EDHREC rank 10517.
//
// Rulings:
//   [2023-09-01] If an instant or sorcery spell you control with lifelink deals damage to you, you
//     gain and lose that much life simultaneously. In this case, your life total doesn't change.
//     (Your life total may increase if the spell also deals damage to other permanents and/or
//     players, however.)
//   [2023-09-01] Some instant and sorcery spells instruct other things to deal damage rather than
//     deal damage themselves. In these cases, you won't gain life for that damage (unless the
//     other things also have lifelink). Notably, a spell that instructs a creature you control to
//     fight won't cause you to gain life.
//
// "Instant and sorcery spells you control have lifelink" is Lo and Li's
// `grantsToSpells` keyword grant: the keyword is the spell's own, so only
// damage the spell itself deals has lifelink (the ruling). Its own Adventure,
// Heartflame Slash, is an instant spell like any other.

const TEXT = "Instant and sorcery spells you control have lifelink.";

export default defineCard({
  name: "Heartflame Duelist",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 1,
  text: TEXT,
  faces: ["Heartflame Duelist", "Heartflame Slash"],
  adventure: true,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { typesAnyOf: ["instant", "sorcery"] }, keywords: ["lifelink"] },
      text: TEXT,
    },
  ],
});
