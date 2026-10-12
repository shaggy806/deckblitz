import { defineCard } from "../define.js";

export default defineCard({
  name: "Liberated Dwarf",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  text: "{R}, Sacrifice this creature: Target green creature gets +1/+0 and gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { colors: ["G"], type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{R}, Sacrifice this creature: Target green creature gets +1/+0 and gains first strike until end of turn.",
    },
  ],
});
