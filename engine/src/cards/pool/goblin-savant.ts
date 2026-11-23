import { defineCard } from "../define.js";

const TEXT = "{T}: Exile the top card of your library. If that card is a Goblin or an artifact card, you may play it this turn.";

export default defineCard({
  name: "Goblin Savant",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        duration: "end-of-turn",
        play: true,
        grantIf: { anyOf: [{ subtype: "Goblin" }, { type: "artifact" }] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
