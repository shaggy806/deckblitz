import { defineCard } from "../define.js";

// EDHREC rank 19462.
//
// "If no creatures attacked this turn" is an intervening-if over every
// player's attacks (turn stat `attacked`, any player): a creature declared
// as an attacker by anyone this turn stops it triggering at all (the ruling).

const TEXT =
  "At the beginning of each player's end step, if no creatures attacked this turn, put a fury counter on this creature. Then this creature deals damage equal to the number of fury counters on it to that player.";

export default defineCard({
  name: "Charging Cinderhorn",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Ox"],
  power: 4,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "not", of: { kind: "turn-stat", stat: "attacked", who: "any-player", atLeast: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "fury", amount: 1 },
          { kind: "damage", amount: { countersOn: "source", counter: "fury" }, who: "active-player" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
