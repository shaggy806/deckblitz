import { defineCard } from "../define.js";

const PLUS_ONE_TEXT =
  '[+1]: Create a 2/3 blue and black Nightmare creature token with "Whenever this token attacks or blocks, each opponent exiles the top two cards of their library."';
const MINUS_THREE_TEXT = "[−3]: Return target nonland permanent to its owner's hand, then that player exiles a card from their hand.";
const MINUS_SEVEN_TEXT =
  "[−7]: You may cast up to three spells from among face-up cards your opponents own from exile without paying their mana costs.";

export default defineCard({
  name: "Ashiok, Nightmare Muse",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ashiok"],
  loyalty: 5,
  text: `${PLUS_ONE_TEXT}\n${MINUS_THREE_TEXT}\n${MINUS_SEVEN_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Nightmare Token (Ashiok)", count: 1 },
      resolve: null,
      text: PLUS_ONE_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["nonland-permanent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          {
            kind: "for-each-player",
            who: { ownerOfTarget: 0 },
            effect: {
              kind: "look-and-choose",
              player: "that-player",
              zone: "hand",
              min: 1,
              max: 1,
              destination: "exile",
              unlinked: true,
              leftover: "stay",
            },
          },
        ],
      },
      resolve: null,
      text: MINUS_THREE_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "cast-now", from: "face-up-exile-opponents-own", repeat: true, upTo: 3, free: true },
      resolve: null,
      text: MINUS_SEVEN_TEXT,
    },
  ],
});
