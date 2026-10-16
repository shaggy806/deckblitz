import { defineCard } from "../define.js";

// "That player" is the player dealt the damage; whether they have a rad
// counter is asked as the trigger resolves. Proliferate is the controller's
// own choice of permanents and players, rad counters included.
const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, that player gets two rad counters if they don't have any rad counters. Otherwise, proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)";

export default defineCard({
  name: "Vexing Radgull",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Mutant"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "player-counters", counter: "rad", who: "that-player", atLeast: 1 },
        then: { kind: "proliferate" },
        else: { kind: "add-player-counters", counter: "rad", amount: 2, who: "trigger-player" },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
