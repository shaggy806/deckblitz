import { defineCard } from "../define.js";
import { EVERY_CREATURE_TYPE } from "../../subtypes.js";

// EDHREC rank 15741. Marvel Super Heroes. Elvish Reclaimer's graveyard
// condition, with Mirror Entity's "all creature types" as a layer-4
// addition.

const STATIC_TEXT =
  "As long as there are two or more creature cards in your graveyard, this creature gets +2/+2 and is all creature types.";

export default defineCard({
  name: "Undercover Skrull",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Skrull", "Shapeshifter", "Villain"],
  power: 1,
  toughness: 1,
  text: `${STATIC_TEXT}\n{T}: Add one mana of any color.`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { type: "creature" } },
      grantPt: [2, 2],
      addSubtypes: [EVERY_CREATURE_TYPE],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
});
