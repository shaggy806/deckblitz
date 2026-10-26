import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 21279.
//
// The reveal is Nylea, Keen-Eyed's `look-and-choose`: the top card, revealed,
// taken into the hand (not drawn) only if it's a creature card — `min: 1`
// makes that mandatory — and otherwise left on top.

const TEXT =
  "When this creature enters, scry 2, then reveal the top card of your library. If it's a creature card, put it into your hand.";

export default defineCard({
  name: "Llanowar Empath",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (To scry 2, look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "scry",
        amount: 2,
        then: {
          kind: "look-and-choose",
          zone: "library",
          count: 1,
          reveal: true,
          min: 1,
          max: 1,
          filter: { type: "creature" },
          destination: "hand",
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
