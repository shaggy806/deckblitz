import { defineCard } from "../define.js";

// EDHREC rank 16900.
//
// Rulings:
//   [2005-10-01] Any Aura card you find must be able to enchant Auratouched Mage as it currently
//     exists, or as it most recently existed on the battlefield if it's no longer on the
//     battlefield. If an effect has made the Mage an artifact, for example, you could search
//     for an Aura with "enchant artifact."
//
// "An Aura card that could enchant it" is the `couldEnchant: "source"` filter
// clause (rule 303.4), bound to the stint the trigger came from and read as
// the Mage is, or as it last existed (`Game.couldEnchantFor`). Nothing
// between the search and the put can move the Mage, so whether it's still on
// the battlefield is asked first: there, the find enters attached to it;
// gone, it's revealed and put into the hand.
const ENTERS_TEXT =
  "When this creature enters, search your library for an Aura card that could enchant it. If this creature is still on the battlefield, put that Aura card onto the battlefield attached to it. Otherwise, reveal the Aura card and put it into your hand. Then shuffle.";

export default defineCard({
  name: "Auratouched Mage",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: ENTERS_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "search-library",
          filter: { subtype: "Aura", couldEnchant: "source" },
          destination: "battlefield",
          min: 0,
          max: 1,
          attachedToSource: true,
        },
        else: {
          kind: "search-library",
          filter: { subtype: "Aura", couldEnchant: "source" },
          destination: "hand",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
