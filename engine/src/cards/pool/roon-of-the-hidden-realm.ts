import { defineCard } from "../define.js";

// EDHREC rank 14091.
//
// Rulings:
//   [2013-10-17] If Roon of the Hidden Realm's ability targets a commander, that card's owner may
//     choose to have it go to the command zone after it is exiled. If they do, it will not be
//     returned to the battlefield at the beginning of the next end step.

const FLICKER_TEXT =
  "{2}, {T}: Exile another target creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.";

// Angel of Condemnation's ability, for {2}.
export default defineCard({
  name: "Roon of the Hidden Realm",
  manaCost: "{2}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rhino", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${FLICKER_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: FLICKER_TEXT,
    },
  ],
});
