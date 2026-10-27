import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 31696.

const TEXT = "{G}, Discard a card: This creature gets +0/+2 until end of turn.";

export default defineCard({
  name: "Krosan Archer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Archer"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
