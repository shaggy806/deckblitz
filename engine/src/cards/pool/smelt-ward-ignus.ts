import { defineCard } from "../define.js";

// EDHREC rank 27773. Any creature with power 3 or less, untapped or your own
// (the ruling); control stays if its power rises after (the ruling).

const TEXT =
  "{2}{R}, Sacrifice this creature: Gain control of target creature with power 3 or less until end of turn. Untap that creature. It gains haste until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Smelt-Ward Ignus",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      sorcerySpeed: true,
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
