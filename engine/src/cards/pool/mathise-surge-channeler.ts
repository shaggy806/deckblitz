import { defineCard } from "../define.js";

// EDHREC rank 13124.

export default defineCard({
  name: "Mathise, Surge Channeler",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Elf", "Shaman", "Sorcerer"],
  power: 1,
  toughness: 1,
  text: "Whenever you cast an instant or sorcery spell with mana value 3 or greater, roll a d20.\n1-9 | Each player draws a card.\n10-19 | You draw a card.\n20 | Copy that spell. You may choose new targets for the copy.",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "gte", n: 3 } },
      },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "draw", amount: 1, who: "each-player" } },
          { min: 10, max: 19, effect: { kind: "draw", amount: 1 } },
          { min: 20, effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true } },
        ],
      },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell with mana value 3 or greater, roll a d20.\n1-9 | Each player draws a card.\n10-19 | You draw a card.\n20 | Copy that spell. You may choose new targets for the copy.",
    },
  ],
});
