import { defineCard } from "../define.js";

// EDHREC rank 26828. The total is its power as it's activated, locked in; the
// damage back is each target's power as it resolves (the ruling). A one-sided
// fight isn't a fight (Polukranos's shape).

const TEXT =
  "{T}: This creature deals damage equal to its power divided as you choose among any number of target creatures. Each of those creatures deals damage equal to its power to this creature.";

export default defineCard({
  name: "Living Inferno",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 8,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "any-number", of: "creature" }],
      divided: { total: { powerOf: "source" }, slot: 0 },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-divided", from: 0 },
          { kind: "for-each-target", from: 0, effect: { kind: "fight", a: 0, b: "source", oneSided: true } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
