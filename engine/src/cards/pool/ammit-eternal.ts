import { defineCard } from "../define.js";
import { afflict } from "../helpers.js";

// Rulings:
//   [2017-07-14] Ammit Eternal's middle ability will resolve before the spell that caused it to
//     trigger. The ability will resolve even if that spell is countered.
//   [2017-07-14] If multiple creatures block a creature with afflict, afflict triggers only once.

export default defineCard({
  name: "Ammit Eternal",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Crocodile", "Demon"],
  power: 5,
  toughness: 5,
  text: "Afflict 3 (Whenever this creature becomes blocked, defending player loses 3 life.)\nWhenever an opponent casts a spell, put a -1/-1 counter on this creature.\nWhenever this creature deals combat damage to a player, remove all -1/-1 counters from it.",
  triggered: [
    afflict(3),
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "Whenever an opponent casts a spell, put a -1/-1 counter on this creature.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "remove-counter",
        target: "source",
        counter: "-1/-1",
        amount: { countersOn: "source", counter: "-1/-1" },
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, remove all -1/-1 counters from it.",
    },
  ],
});
