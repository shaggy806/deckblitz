import { defineCard } from "../define.js";

export default defineCard({
  name: "Geological Appraiser",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, if you cast it, discover 3. (Exile cards from the top of your library until you exile a nonland card with mana value 3 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [],
      effect: { kind: "discover", amount: 3 },
      resolve: null,
      text: "When this creature enters, if you cast it, discover 3.",
    },
  ],
});
