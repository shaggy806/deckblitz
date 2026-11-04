import { defineCard } from "../define.js";

// The back face of Birgi, God of Storytelling.

const TEXT = "Discard a card: Exile the top two cards of your library. You may play those cards this turn.";

export default defineCard({
  name: "Harnfel, Horn of Bounty",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  faces: ["Birgi, God of Storytelling", "Harnfel, Horn of Bounty"],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
