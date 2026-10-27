import { defineCard } from "../define.js";

// EDHREC rank 32038. Flame Elemental's sacrifice ability without the tap: the
// power is read as the creature last existed (rule 608.2h).

export default defineCard({
  name: "Minotaur Illusionist",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Wizard"],
  power: 3,
  toughness: 4,
  text: "{1}{U}: This creature gains shroud until end of turn. (It can't be the target of spells or abilities.)\n{R}, Sacrifice this creature: It deals damage equal to its power to target creature.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "shroud", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{U}: This creature gains shroud until end of turn.",
    },
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: "{R}, Sacrifice this creature: It deals damage equal to its power to target creature.",
    },
  ],
});
