import { defineCard } from "../define.js";

// EDHREC rank 6744.
//
// Rulings:
//   [2022-09-09] Fallaji Wayfarer's color identity is green. It may be included in any commander
//     deck where the commander's color identity includes green.
//   [2022-09-09] The first ability of Fallaji Wayfarer functions in all zones. For example, you
//     may find Fallaji Wayfarer while searching your library if an effect instructs you to search
//     your library for a multicolored card.
//
// "Is all colors" is a characteristic-defining ability (rule 604.3), so `colors` holds all five,
// in every zone, as Transguild Courier's does. `colorsOutsideIdentity` keeps them out of its
// colour identity, which is then its mana cost's green alone.

const CONVOKE =
  "Multicolored spells you cast have convoke. (Your creatures can help cast those spells. Each creature you tap while casting a multicolored spell pays for {1} or one mana of a color that creature is.)";

export default defineCard({
  name: "Fallaji Wayfarer",
  manaCost: "{2}{G}",
  colors: ["W", "U", "B", "R", "G"],
  colorsOutsideIdentity: true,
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 4,
  text: `Fallaji Wayfarer is all colors. This ability doesn't affect its color identity. (It can be in any deck whose commander's color identity includes green.)\n${CONVOKE}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { multicolored: true }, convoke: true },
      text: CONVOKE,
    },
  ],
});
