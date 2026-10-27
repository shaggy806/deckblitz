import { defineCard } from "../define.js";

// EDHREC rank 30123. A Spellshaper.

const TEXT = "{R}, {T}, Discard a card: Target creature can't block this turn.";

export default defineCard({
  name: "Bola Warrior",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper", "Warrior"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
