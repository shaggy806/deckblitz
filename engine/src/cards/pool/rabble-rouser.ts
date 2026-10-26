import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 27198.
//
// Bloodthirst 1 as Bloodrage Vampire's. The pump reads this creature's power
// as it resolves (its last known power if it has left — rule 608.2h) and
// includes this creature if it's attacking.

const BLOODTHIRST =
  "Bloodthirst 1 (If an opponent was dealt damage this turn, this creature enters with a +1/+1 counter on it.)";
const PUMP = "{R}, {T}: Attacking creatures get +X/+0 until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Rabble-Rouser",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  text: `${BLOODTHIRST}\n${PUMP}`,
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
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: { powerOf: "source" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP,
    },
  ],
});
