import { defineCard } from "../define.js";

// Star Trek Commander (TRC). Counted as the ability resolves.

const TEXT = "{2}, {T}: Draw a card for each nontoken permanent you control that entered this turn.";

export default defineCard({
  name: "Spock, Voice of Reason",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vulcan", "Human", "Scientist"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "draw",
        amount: { countOf: { controlledBy: "you", token: false, enteredThisTurn: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
