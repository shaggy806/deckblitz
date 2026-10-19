import { defineCard } from "../define.js";

// EDHREC rank 13479.
//
// Prototype (rule 718) is `prototype`, as on Combat Thresher and Frogmyr Enforcer.
//
// Rulings:
//   Use Rootwire Amalgam's power as it existed the last time it was on the battlefield (not the
//   power of the creature card in the graveyard) to determine the value of X — `powerOf:
//   "source"` reads the sacrificed creature's last-known power (Stalactite Stalker's shape), so a
//   prototyped 2/3 makes a 6/6 and a pumped one counts its pump.

const SAC_TEXT =
  "{3}{G}{G}, Sacrifice this creature: Create an X/X colorless Golem artifact creature token, where X is three times this creature's power. It gains haste until end of turn. Activate only as a sorcery.";
const X = { product: [{ powerOf: "source" }, 3] } as const;

export default defineCard({
  name: "Rootwire Amalgam",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 5,
  toughness: 5,
  text:
    "Prototype {1}{G} — 2/3 (You may cast this spell with different mana cost, color, and size. " +
    `It keeps its abilities and types.)\n${SAC_TEXT}`,
  prototype: { cost: "{1}{G}", power: 2, toughness: 3 },
  activated: [
    {
      cost: { mana: "{3}{G}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Golem Token (Rootwire Amalgam)",
        count: 1,
        basePt: { power: X, toughness: X },
        gainUntilEndOfTurn: ["haste"],
      },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
});
