import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 765.
//
// The ability it has comes from the same static as the loss, so it outlasts it
// (`loseAllAbilities`: rule 613.7). Its subtypes go with the lost types (205.1a).
//
// Rulings:
//   [2016-07-13] At the time the permanent becomes enchanted, Imprisoned in the Moon causes it to
//     lose all abilities except the noted mana ability. Any abilities the permanent gains after
//     that point will work normally.
//   [2016-07-13] Becoming a land may cause other Auras to become illegally attached. These are put
//     into their owner's graveyard, and any Equipment attached to the land become unattached and
//     remain on the battlefield. Counters on the land remain on it even if they don't do anything.
//   [2016-07-13] If the enchanted permanent is a land and has land types, it retains those types
//     even though it loses any intrinsic mana abilities associated with them. For example, a
//     Plains enchanted by Imprisoned in the Moon is still a Plains, but it can't tap for {W}, only
//     for {C}.
//   [2016-07-13] If you remove Imprisoned in the Moon from a planeswalker after tapping it for
//     mana, you can still activate a loyalty ability of that planeswalker even though it's tapped.
//   [2016-07-13] The permanent will keep any supertypes it previously had. Notably, if Imprisoned
//     in the Moon is enchanting a legendary permanent, that permanent will continue to be
//     legendary.

export default defineCard({
  name: "Imprisoned in the Moon",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature, land, or planeswalker\nEnchanted permanent is a colorless land with \"{T}: Add {C}\" and loses all other card types and abilities.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land", "planeswalker"] } }],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["land"],
      setColors: [],
      loseAllAbilities: true,
      grantsActivated: [addManaAbility({ mana: "C", text: "{T}: Add {C}." })],
      text: 'Enchanted permanent is a colorless land with "{T}: Add {C}" and loses all other card types and abilities.',
    },
  ],
});
