import { defineCard } from "../define.js";

export default defineCard({
  name: "Smelt-Ward Minotaur",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 2,
  toughness: 3,
  text: "Whenever you cast an instant or sorcery spell, target creature an opponent controls can't block this turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, target creature an opponent controls can't block this turn.",
    },
  ],
});
