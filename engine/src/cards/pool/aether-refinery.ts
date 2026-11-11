import { defineCard } from "../define.js";

// EDHREC rank 5626.
//
// Rulings:
//   [2024-06-07] If two or more effects attempt to modify how many {E} you get, you choose the
//     order to apply those effects, no matter who controls the sources of those effects.
//   [2024-06-07] If you control two Aether Refineries, the amount of {E} you get is four times the
//     original number.
const DOUBLE_TEXT = "If you would get one or more {E} (energy counters), you get twice that many {E} instead.";
const MAKE_TEXT =
  "{T}: You get {E}, then you may pay one or more {E}. If you do, create an X/X black Aetherborn creature token, where X is the amount of {E} paid this way.";

export default defineCard({
  name: "Aether Refinery",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${DOUBLE_TEXT}\n${MAKE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-add-counter",
        onPlayers: "you",
        counterKind: "energy",
        instead: { modify: { times: 2 } },
      },
      text: DOUBLE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "get-energy", amount: 1 },
          {
            kind: "may",
            prompt: "Pay one or more {E} to create an X/X Aetherborn, X the amount paid?",
            costEnergyX: "one-or-more",
            effect: {
              kind: "create-token",
              token: "Aetherborn Token",
              count: 1,
              basePt: { power: "x", toughness: "x" },
            },
          },
        ],
      },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});
