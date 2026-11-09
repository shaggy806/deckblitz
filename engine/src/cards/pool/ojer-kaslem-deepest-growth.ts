import { defineCard } from "../define.js";

// EDHREC rank 2065. A creature card and/or a land card from among the revealed
// ones (`together.oneEach`; a land creature may fill either slot), the rest on
// the bottom in a random order. Dying, it comes back transformed (Ojer Axonil's
// shape).

const COMBAT_TEXT =
  "Whenever Ojer Kaslem deals combat damage to a player, reveal that many cards from the top of your library. You may put a creature card and/or a land card from among them onto the battlefield. Put the rest on the bottom in a random order.";
const DIES_TEXT = "When Ojer Kaslem dies, return it to the battlefield tapped and transformed under its owner's control.";

export default defineCard({
  name: "Ojer Kaslem, Deepest Growth",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${COMBAT_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { triggerValue: true },
        reveal: true,
        min: 0,
        max: 2,
        together: {
          oneEach: [
            { label: "a creature card", filter: { type: "creature" } },
            { label: "a land card", filter: { type: "land" } },
          ],
          text: "a creature card and/or a land card",
        },
        destination: "battlefield",
        leftover: "bottom-random",
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true, transformed: true },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Ojer Kaslem, Deepest Growth", "Temple of Cultivation"],
  transform: true,
});
