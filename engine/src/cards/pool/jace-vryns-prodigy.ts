import { defineCard } from "../define.js";

// The graveyard is counted after the discard, as the ability resolves (its
// ruling); Jace comes back as a planeswalker with its loyalty.
const TEXT =
  "{T}: Draw a card, then discard a card. If there are five or more cards in your graveyard, exile Jace, then return him to the battlefield transformed under his owner's control.";

export default defineCard({
  name: "Jace, Vryn's Prodigy",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 5 },
            then: { kind: "flicker", target: "source", transformed: true },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Jace, Vryn's Prodigy", "Jace, Telepath Unbound"],
  transform: true,
});
