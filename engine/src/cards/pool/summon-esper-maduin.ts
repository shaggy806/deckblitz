import { defineCard } from "../define.js";

// The back face of Esper Origins, which puts it onto the battlefield
// transformed when cast from a graveyard (see that file).
const REVEAL_TEXT = "I — Reveal the top card of your library. If it's a permanent card, put it into your hand.";
const MANA_TEXT = "II — Add {G}{G}.";
const PUMP_TEXT = "III — Other creatures you control get +2/+2 and gain trample until end of turn.";

export default defineCard({
  name: "Summon: Esper Maduin",
  art: "https://cards.scryfall.io/art_crop/back/0/f/0f503360-216a-4629-89b2-d32072850aef.jpg",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Elemental"],
  power: 4,
  toughness: 4,
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${REVEAL_TEXT}\n${MANA_TEXT}\n${PUMP_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: REVEAL_TEXT,
    },
    {
      at: [2],
      targets: [],
      // Not a mana ability: it uses the stack (the ruling).
      effect: { kind: "add-mana", mana: "G", amount: 2 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            exceptSource: true,
            power: 2,
            toughness: 2,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            exceptSource: true,
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  faces: ["Esper Origins", "Summon: Esper Maduin"],
  transform: true,
});
