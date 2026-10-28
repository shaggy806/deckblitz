import { defineCard } from "../define.js";

// EDHREC rank 2677.
//
// Rulings:
//   [2016-06-08] Activated abilities contain a colon. They're generally written “[Cost]:
//     [Effect].” Some keywords are activated abilities and will have colons in their reminder
//     text.
//   [2021-06-18] Cursed Totem doesn't stop players from activating abilities of creature cards
//     that aren't on the battlefield, such as cycling or unearth.
//   [2021-06-18] Other abilities of creatures, including static abilities and triggered abilities,
//     are unaffected.
//   [2021-06-18] Cursed Totem stops players from activating mana abilities of creatures.
//   [2021-06-18] Activated abilities of noncreature permanents that would make them become
//     creatures (such as a Vehicle's crew ability) can still be activated. Once they become
//     creatures, any abilities they have cannot be activated.
//
// Collector Ouphe's shape over creatures: `prohibits.abilitiesOf` bars every
// activated ability of a battlefield permanent matching the filter as it is
// now (a Vehicle before it's crewed isn't a creature), mana abilities
// included, and leaves cards in other zones alone.
const TEXT = "Activated abilities of creatures can't be activated.";

export default defineCard({
  name: "Cursed Totem",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", abilitiesOf: { type: "creature" } },
      text: TEXT,
    },
  ],
});
