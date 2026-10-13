import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 6994.
//
// Rulings:
//   [2024-06-07] If Pyrogoyf or the relevant Lhurgoyf creature leaves the battlefield while
//     Pyrogoyf's last ability is on the stack, use its power as it last existed on the battlefield
//     to determine how much damage is dealt.
//   [2024-06-07] Card types that can appear on cards in a graveyard are artifact, battle,
//     creature, enchantment, instant, kindred, land, planeswalker, and sorcery. Legendary, basic,
//     and snow are supertypes, not card types; Lhurgoyf, Forest, and Siege are subtypes, not card
//     types.
//   [2024-06-07] The ability that defines Pyrogoyf's power and toughness counts card types, not
//     cards. If the only card in all graveyards is a single artifact creature card, Pyrogoyf will
//     be a 2/3. If the cards in all graveyards are ten artifact cards and ten creature cards,
//     Pyrogoyf will still be a 2/3.
//   [2024-06-07] The ability that defines Pyrogoyf's power and toughness works in all zones, not
//     just the battlefield.

const CDA =
  "Pyrogoyf's power is equal to the number of card types among cards in all graveyards and its toughness is equal to that number plus 1.";
const ENTERS =
  "Whenever this creature or another Lhurgoyf creature you control enters, that creature deals damage equal to its power to any target.";

export default defineCard({
  name: "Pyrogoyf",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 1,
  text: `${CDA}\n${ENTERS}`,
  // Tarmogoyf's characteristic-defining ability (it works in every zone).
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { cardTypesInGraveyard: {} }, plusPower: 0, plusToughness: 1 },
      text: CDA,
    },
  ],
  // "This creature or another Lhurgoyf creature you control" is two triggers
  // (`thisOrAnother`); the entering creature deals the damage, at its power
  // as it last existed if it has left (the first ruling — Warstorm Surge's
  // shape).
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", subtype: "Lhurgoyf" } },
    targets: ["any-target"],
    effect: { kind: "damage", amount: { powerOf: "trigger-object" }, target: 0, from: "trigger-object" },
    resolve: null,
    text: ENTERS,
  }),
});
