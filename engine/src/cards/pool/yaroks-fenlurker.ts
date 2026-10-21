import { defineCard } from "../define.js";

// EDHREC rank 11476.
//
// Each opponent chooses the card from their own hand (a `look-and-choose`
// over "that player's" hand), and it's exiled face up with no link to this
// creature.

const ENTERS = "When this creature enters, each opponent exiles a card from their hand.";
const PUMP = "{2}{B}: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Yarok's Fenlurker",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 1,
  toughness: 1,
  text: `${ENTERS}\n${PUMP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
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
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
  ],
});
