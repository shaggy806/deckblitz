import { defineCard } from "../define.js";

export default defineCard({
  name: "Seething Pathblazer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Sacrifice an Elemental: This creature gets +2/+0 and gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Elemental" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 2,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Sacrifice an Elemental: This creature gets +2/+0 and gains first strike until end of turn.",
    },
  ],
});
