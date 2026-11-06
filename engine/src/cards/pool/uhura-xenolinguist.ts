import { defineCard } from "../define.js";

// Star Trek Commander (TRC). Any player's non-Human creature.

const TEXT = "Whenever a non-Human creature enters, you may pay {1}. If you do, draw a card.";

export default defineCard({
  name: "Uhura, Xenolinguist",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", notSubtypes: ["Human"] } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1} to draw a card?", cost: "{1}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
