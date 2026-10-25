import { defineCard } from "../define.js";

// EDHREC rank 16711.
//
// "Dies this way" is `this-way: died` (Saw in Half): indestructible, a
// regeneration, or a replacement sending it elsewhere makes no token (the
// ruling). The token is the activator's, its P/T read from the destroyed
// creature as it last existed on the battlefield (rule 608.2h — Broken Visage).
const TEXT =
  "{B}{B}{B}, {T}: Destroy target creature. If that creature dies this way, create a black Vampire creature token. Its power is equal to that creature's power and its toughness is equal to that creature's toughness.";

export default defineCard({
  name: "Kalitas, Bloodchief of Ghet",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 5,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}{B}{B}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "died" },
            then: {
              kind: "create-token",
              token: "X/X Vampire Token (Black)",
              count: 1,
              basePt: { power: { powerOf: 0 }, toughness: { toughnessOf: 0 } },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
