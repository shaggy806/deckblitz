import { defineCard } from "../define.js";

// EDHREC rank 27626. Shards of Alara.

export default defineCard({
  name: "Thorn-Thrash Viashino",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 2,
  toughness: 2,
  devour: { multiplier: 2, filter: { type: "creature" } },
  text: "Devour 2 (As this creature enters, you may sacrifice any number of creatures. It enters with twice that many +1/+1 counters on it.)\n{G}: This creature gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: "{G}: This creature gains trample until end of turn.",
    },
  ],
});
