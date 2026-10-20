import { defineCard } from "../define.js";

// EDHREC rank 11963.
//
// Rulings:
//   [2020-11-10] Card types that can appear on permanents and cards in a library include artifact,
//     creature, enchantment, land, planeswalker. Legendary, basic, and snow are supertypes, not
//     card types; Dragon and Pirate are subtypes, not card types.
//
// Sarinth Steelseeker's look at the top card, its filter bound to the entering
// permanent's card types (`sharesCardTypeWith: "trigger-object"`, as it last
// existed if it has left). A card not taken stays on top.

const TEXT =
  "Whenever another permanent you control enters, look at the top card of your library. If it shares a card type with that permanent, you may reveal that card and put it into your hand.";

export default defineCard({
  name: "Amareth, the Lustrous",
  manaCost: "{3}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", otherOnly: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { sharesCardTypeWith: "trigger-object" },
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
