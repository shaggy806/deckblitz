import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 27790.
//
// Bloodthirst 1: Bloodrage Vampire's enters-with-counters replacement.

const BLOODTHIRST =
  "Bloodthirst 1 (If an opponent was dealt damage this turn, this creature enters with a +1/+1 counter on it.)";

export default defineCard({
  name: "Bloodscale Prowler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 3,
  toughness: 1,
  text: BLOODTHIRST,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 1,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST,
    },
  ],
});
