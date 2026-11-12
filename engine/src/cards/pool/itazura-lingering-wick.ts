import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. The numbers are a secret `vote` of
// `for: { number }` among the opponents (Wheel of Misfortune's): none is shown
// until the last is in. You choose among those tied for the highest
// (`choose-opponent`'s `whoIf`); that player is dealt that much and may cast
// one of the exiled cards free (`cast-now` by them). Then you take one of
// those still in exile — not the one cast — into your hand.
const TEXT =
  "At the beginning of your upkeep, exile the top three cards of your library. Each opponent secretly chooses a number 0 or greater. Then those numbers are revealed. Choose an opponent with the highest number. Itazura deals that much damage to them, then they may cast a spell from among those cards without paying its mana cost. You put a card from among them that wasn't cast this way into your hand.";

export default defineCard({
  name: "Itazura, Lingering Wick",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: "you", amount: 3 },
          { kind: "vote", choose: true, secret: true, who: "each-opponent", for: { number: { min: 0 } } },
          {
            kind: "choose-opponent",
            whoIf: { kind: "voted-number", who: "that-player", is: "highest" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "damage", amount: { votedNumber: "highest" }, who: "that-player" },
                { kind: "cast-now", from: "exiled-this-way", by: "that-player", free: true },
              ],
            },
          },
          {
            kind: "look-and-choose",
            zone: "exiled-this-way",
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "stay",
            prompt: "Put a card from among them into your hand",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
