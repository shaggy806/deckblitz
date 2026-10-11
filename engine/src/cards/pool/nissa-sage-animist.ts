import { defineCard } from "../define.js";

// The back face of Nissa, Vastwood Seer.
//
// Rulings:
//   [2015-06-22] You can activate Nissa, Sage Animist's second ability even if you already
//     control an Ashaya, the Awoken World. Just after the second token is created, you'll choose
//     one to remain on the battlefield. The other will be put into your graveyard and
//     subsequently cease to exist.
//   [2015-06-22] If a land becomes a creature but hasn't continuously been under its
//     controller's control since that player's most recent turn began, it won't be able to attack
//     and its abilities with {T} in the cost (including mana abilities) won't be able to be
//     activated.
//
// +1 is Coiling Oracle's reveal: a land must be taken onto the battlefield,
// anything else goes to the hand. −7 untaps every target, then animates them —
// two instructions, in that order — with no end to the animation: they stay
// 6/6 Elemental creature lands.
const PLUS_TEXT =
  "+1: Reveal the top card of your library. If it's a land card, put it onto the battlefield. Otherwise, put it " +
  "into your hand.";
const MINUS2_TEXT = "−2: Create Ashaya, the Awoken World, a legendary 4/4 green Elemental creature token.";
const MINUS7_TEXT = "−7: Untap up to six target lands. They become 6/6 Elemental creatures. They're still lands.";

export default defineCard({
  name: "Nissa, Sage Animist",
  art: "https://cards.scryfall.io/art_crop/back/f/f/ff0063da-ab6b-499d-8e87-8b34d46f0372.jpg",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nissa"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${MINUS2_TEXT}\n${MINUS7_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        destination: "battlefield",
        leftover: "hand",
        filter: { type: "land" },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Ashaya, the Awoken World", count: 1 },
      resolve: null,
      text: MINUS2_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "land", max: 6 }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "untap", target: 0 } },
          {
            kind: "for-each-target",
            from: 0,
            effect: {
              kind: "animate",
              target: 0,
              power: 6,
              toughness: 6,
              addTypes: ["creature"],
              addSubtypes: ["Elemental"],
              duration: "permanent",
            },
          },
        ],
      },
      resolve: null,
      text: MINUS7_TEXT,
    },
  ],
  faces: ["Nissa, Vastwood Seer", "Nissa, Sage Animist"],
  transform: true,
});
