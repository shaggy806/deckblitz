import { defineCard } from "../define.js";

const GRANTED_TEXT = "{T}: This creature deals 1 damage to each opponent.";
const TEXT = `Magecraft — Whenever you cast or copy an instant or sorcery spell, until end of turn, Spirit creatures you control gain "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Lorehold Apprentice",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: {
        kind: "grant-activated-all",
        filter: { type: "creature", subtype: "Spirit", controlledBy: "you" },
        ability: {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "damage", amount: 1, who: "each-opponent" },
          resolve: null,
          text: GRANTED_TEXT,
        },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
