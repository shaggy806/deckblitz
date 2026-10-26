import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 25502. Walking Wall's shape.

const TEXT =
  "{3}: This creature gets +3/-1 until end of turn and can attack this turn as though it didn't have defender. Activate only once each turn.";

export default defineCard({
  name: "Mobile Fort",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 6,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: -1, duration: "end-of-turn" },
          { kind: "attack-despite-defender", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
      oncePerTurn: true,
    },
  ],
});
