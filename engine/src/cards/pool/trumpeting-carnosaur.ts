import { defineCard } from "../define.js";

// EDHREC rank 1658.
//
// The hand ability is Gideon's Memorial's: `zone: "hand"` with the discard of
// the card itself as its cost, the card (in the graveyard by then) the source
// of the damage.
const HAND_TEXT = "{2}{R}, Discard this card: It deals 3 damage to target creature or planeswalker.";

export default defineCard({
  name: "Trumpeting Carnosaur",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\nWhen this creature enters, discover 5.\n${HAND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discover", amount: 5 },
      resolve: null,
      text: "When this creature enters, discover 5.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      zone: "hand",
      text: HAND_TEXT,
    },
  ],
});
