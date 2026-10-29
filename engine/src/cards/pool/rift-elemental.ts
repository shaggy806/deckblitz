import { defineCard } from "../define.js";

// EDHREC rank 11768.
//
// Rulings:
//   [2007-05-01] The counter is removed as a cost, so it can't be responded to.
//   [2007-05-01] If an suspended card's last time counter is removed this way, the suspend
//     triggered ability is put on the stack on top of the Rift Elemental ability. The same is true
//     for the vanishing ability of a permanent that loses its last time counter.

const TEXT =
  "{1}{R}, Remove a time counter from a permanent you control or suspended card you own: This creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Rift Elemental",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{1}{R}",
        tap: false,
        removeCounter: { kind: "time", count: 1, from: {}, orSuspended: true },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
