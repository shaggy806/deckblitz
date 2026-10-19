import { defineCard } from "../define.js";

// EDHREC rank 20815.
// Silent Hallcreeper's `become-copy` of another target creature, granted to
// commander creatures (Candlekeep Sage's scope); the granted ability's
// `source` is the commander that has it. No duration: it lasts until the
// commander leaves the battlefield, or a later copy effect overrides it.
//
// Rulings:
//   [2022-06-10] If Shameless Charlatan is your commander and somehow becomes a creature, and you
//     use the ability it grants itself to make it a copy of another creature, it will no longer
//     have its ability so it would no longer grant the activated ability to commander creatures
//     you own (including itself).
//   [2022-06-10] The copy effect doesn't have a duration. It lasts until the commander leaves the
//     battlefield, though another copy effect with a later timestamp (perhaps from a new
//     activation of the ability granted by Shameless Charlatan) would override the effect for as
//     long as it's active.
//   [2022-06-10] If your commander becomes a copy of something else while you control Shameless
//     Charlatan, it will still be your commander and it will still have the ability granted to it.
//   [2022-06-10] If you control a Background that grants an ability to commander creatures you
//     own, and you own more than one commander creature, each of them will have that ability.

const GRANTED_TEXT = "{2}{U}: This creature becomes a copy of another target creature.";
const TEXT = `Commander creatures you own have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Shameless Charlatan",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsActivated: [
        {
          cost: { mana: "{2}{U}", tap: false },
          targets: [{ kind: "other", of: "creature" }],
          effect: { kind: "become-copy", target: "source", of: 0 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
