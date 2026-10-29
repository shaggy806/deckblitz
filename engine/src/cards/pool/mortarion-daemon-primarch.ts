import { defineCard } from "../define.js";

// Rulings:
//   [2022-10-07] If a spell or ability sets a player's life total to a specified amount, that
//     player gains or loses the appropriate amount of life.
//   [2022-10-07] Mortarion, Demon Primarch's ability looks only at the amount of life you've lost
//     this turn, regardless of any life you may have gained.

const PRIMARCH_TEXT =
  "Primarch of the Death Guard — At the beginning of your end step, you may pay {X}. If you do, create X 2/2 black Astartes Warrior creature tokens with menace. X can't be greater than the amount of life you lost this turn.";

export default defineCard({
  name: "Mortarion, Daemon Primarch",
  manaCost: "{5}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Primarch"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${PRIMARCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to create X 2/2 Astartes Warriors with menace?",
        cost: "{X}",
        // Life lost this turn, whatever was gained (the ruling).
        maxX: { turnStat: "life-lost" },
        effect: { kind: "create-token", token: "Astartes Warrior Token (Mortarion, Daemon Primarch)", count: "x" },
      },
      resolve: null,
      text: PRIMARCH_TEXT,
    },
  ],
});
