import { defineCard } from "../define.js";

// EDHREC rank 6600.
//
// "The exiled card" is the one the cost exiled from hand (`{ paid: "exiled"
// }`), given its four time counters where it is: with them it's suspended
// (rule 702.62b), whether or not it had suspend. Its targets are chosen when
// it's finally cast (the ruling); a creature cast that way has haste.

const TEXT =
  "{2}, Exile a nonland card from your hand: Put four time counters on the exiled card. If it doesn't have suspend, it gains suspend. (At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. If it's a creature, it has haste.)";

export default defineCard({
  name: "Jhoira of the Ghitu",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, exileFromHand: { count: 1, filter: { notTypes: ["land"] } } },
      targets: [],
      effect: { kind: "give-suspend", timeCounters: 4, target: { paid: "exiled" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
