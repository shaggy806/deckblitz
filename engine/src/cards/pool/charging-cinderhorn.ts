import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 19462.
//
// Rulings:
//   [2016-11-08] Charging Cinderhorn's triggered ability doesn't trigger at all if a creature
//     attacked this turn. It won't get a fury counter or deal damage.
//   [2016-11-08] If Charging Cinderhorn leaves the battlefield in response to its triggered
//     ability, it won't get a new fury counter, but it will deal damage equal to the number of
//     fury counters it had before leaving the battlefield.
//   [2016-11-08] It triggers at the beginning of each player's end step if no creatures
//     attacked, including yours, and even if it wasn't on the battlefield during combat.
//
// Titan Hunter's each-end-step shape. "No creatures attacked this turn" is no
// player having declared an attacker (`turn-stat` "attacked" over every
// player — a creature put onto the battlefield attacking never "attacked",
// rule 508.4). The damage reads its fury counters through `countersOn`
// "source", as it last existed if it has left (the ruling), and the counter
// isn't put on a Cinderhorn that's gone.
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
