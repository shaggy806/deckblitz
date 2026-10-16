import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 15031.
//
// The hand ability is channel's shape (`zone: "hand"`: discarding the card is
// part of its cost), though the card doesn't call it that.
const FETCH =
  "{1}{G}, Discard this card: Search your library for a basic land card or a Desert card, reveal it, put it into your hand, then shuffle. You gain 3 life.";

export default defineCard({
  name: "Spinewoods Armadillo",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Armadillo"],
  power: 7,
  toughness: 7,
  keywords: ["reach"],
  text: `Reach\nWard {3} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {3}.)\n${FETCH}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { anyOf: [{ supertype: "basic", type: "land" }, { subtype: "Desert" }] },
            destination: "hand",
            min: 0,
            max: 1,
            reveal: true,
          },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: FETCH,
      zone: "hand",
    },
  ],
  triggered: [ward({ mana: "{3}" })],
});
