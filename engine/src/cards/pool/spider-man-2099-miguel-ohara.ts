import { defineCard } from "../define.js";

// EDHREC rank 11299.

const ENTER_TEXT = "When Spider-Man 2099 enters, return up to one target creature to its owner's hand.";
const HIT_TEXT = "Whenever one or more creatures you control deal combat damage to a player, draw a card.";

export default defineCard({
  name: "Spider-Man 2099, Miguel O'Hara",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${HIT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: HIT_TEXT,
    },
  ],
});
