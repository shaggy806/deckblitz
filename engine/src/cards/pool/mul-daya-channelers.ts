import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// Each bonus reads the top card live; a card that is both a creature and a
// land (Dryad Arbor) gives both (the ruling).

const REVEAL_TEXT = "Play with the top card of your library revealed.";
const CREATURE_TEXT = "As long as the top card of your library is a creature card, this creature gets +3/+3.";
const LAND_TEXT =
  'As long as the top card of your library is a land card, this creature has "{T}: Add two mana of any one color."';

export default defineCard({
  name: "Mul Daya Channelers",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid", "Shaman"],
  power: 2,
  toughness: 2,
  text: `${REVEAL_TEXT}\n${CREATURE_TEXT}\n${LAND_TEXT}`,
  static: [
    { affects: { scope: "self" }, visibility: { libraryTopRevealed: "you" }, text: REVEAL_TEXT },
    {
      affects: { scope: "self" },
      condition: { kind: "library-top", filter: { type: "creature" } },
      grantPt: [3, 3],
      text: CREATURE_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "library-top", filter: { type: "land" } },
      grantsActivated: [addManaAbility({ mana: "any-color", amount: 2, text: "{T}: Add two mana of any one color." })],
      text: LAND_TEXT,
    },
  ],
});
