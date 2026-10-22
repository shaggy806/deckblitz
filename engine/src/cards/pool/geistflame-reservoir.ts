import { defineCard } from "../define.js";

// EDHREC rank 17653.
//
// Rulings:
//   [2021-09-24] You must still pay all costs and follow all timing rules to play a card exiled
//     with Geistflame Reservoir's last ability.
//   [2021-09-24] You choose how many counters to remove from Geistflame Reservoir as you activate
//     its second ability, not as it resolves.

export default defineCard({
  name: "Geistflame Reservoir",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: "Whenever you cast an instant or sorcery spell, put a charge counter on this artifact.\n{1}{R}, {T}, Remove any number of charge counters from this artifact: It deals that much damage to any target.\n{1}{R}, {T}: Exile the top card of your library. You may play that card this turn.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true, removeCounter: { kind: "charge", count: "x" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: "{1}{R}, {T}, Remove any number of charge counters from this artifact: It deals that much damage to any target.",
    },
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}, {T}: Exile the top card of your library. You may play that card this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, put a charge counter on this artifact.",
    },
  ],
});
