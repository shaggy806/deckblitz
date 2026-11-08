import { defineCard } from "../define.js";
import { CHOSEN_CREATURE_TYPE, LAND_TYPES } from "../helpers.js";

// EDHREC rank 30491. Illusionary Presence's chosen land type, as snow
// landwalk (a snow land of that type — the ruling), granted to the target
// until end of turn; Dragon Mask's return at the next end step.
//
// Rulings:
//   You choose a land subtype, and if the defending player controls any snow lands with that
//     subtype, the targeted creature can't be blocked.

const TEXT =
  "{2}{R}, {T}: Choose a land type. Target creature you control gains snow landwalk of the chosen type until end of turn. Return that creature to its owner's hand at the beginning of the next end step. (It can't be blocked as long as defending player controls a snow land of that type.)";

export default defineCard({
  name: "Barbarian Guides",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-creature-type",
            options: LAND_TYPES,
            prompt: "Choose a land type",
            then: {
              kind: "grant-static",
              target: 0,
              ability: {
                affects: { scope: "self" },
                landwalk: { type: "land", supertype: "snow", subtype: CHOSEN_CREATURE_TYPE },
                text: "Snow landwalk of the chosen type",
              },
              duration: "end-of-turn",
            },
          },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "return-to-hand", target: 0 },
            text: "Return that creature to its owner's hand.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
