import { defineCard } from "../define.js";

// Rulings:
//   The card types that can appear on cards exiled with Keen-Eyed Curator are artifact, battle,
//     creature, enchantment, instant, kindred, land, planeswalker, and sorcery. Legendary, basic,
//     and snow are supertypes, not card types. Raccoon and Scout are subtypes, not card types.

const STATIC_TEXT = "As long as there are four or more card types among cards exiled with this creature, it gets +4/+4 and has trample.";
const EXILE_TEXT = "{1}: Exile target card from a graveyard.";

export default defineCard({
  name: "Keen-Eyed Curator",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Raccoon", "Scout"],
  power: 3,
  toughness: 3,
  text: `${STATIC_TEXT}\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "exiled-with-source", atLeast: 4, now: true, cardTypes: true },
      grantPt: [4, 4],
      grantKeywords: ["trample"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      resolve: null,
      text: EXILE_TEXT,
      targets: [{ kind: "card-in-graveyard" }],
      effect: { kind: "exile", target: 0, linked: true },
    },
  ],
});
