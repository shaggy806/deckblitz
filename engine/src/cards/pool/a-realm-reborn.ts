import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 7472.
//
// Cryptolith Rite's grant, over every other permanent you control: the
// `"filter"` scope with only `controlledBy`, and `excludeSelf` for "other".
const TEXT = 'Other permanents you control have "{T}: Add one mana of any color."';

export default defineCard({
  name: "A Realm Reborn",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you" }, excludeSelf: true },
      grantsActivated: [addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." })],
      text: TEXT,
    },
  ],
});
