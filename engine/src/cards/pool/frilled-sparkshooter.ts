import { defineCard } from "../define.js";

// EDHREC rank 14384. Cackling Slasher's gated enters-with replacement, on
// Vampire Socialite's condition: whether an opponent lost any life this turn,
// not how their total changed (the ruling).
const ENTER_TEXT = "This creature enters with a +1/+1 counter on it if an opponent lost life this turn.";

export default defineCard({
  name: "Frilled Sparkshooter",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Archer"],
  power: 3,
  toughness: 3,
  keywords: ["reach", "menace"],
  text: `Reach, menace\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});
