import { defineCard } from "../define.js";

// The creatures pumped are those you control as it resolves (the ruling, rule
// 611.2c) — the two Elementals included, since they're made first.

const ACTIVATED_TEXT =
  "{2}{R}, {T}, Discard a card: Create two 1/1 blue and red Elemental creature tokens. Creatures you control get +1/+0 and gain haste until end of turn.";

export default defineCard({
  name: "Kyren Flamewright",
  art: "https://cards.scryfall.io/art_crop/back/4/0/407d6723-bf58-403e-b2ac-ba52c51d356f.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Spellshaper"],
  power: 3,
  toughness: 3,
  text: ACTIVATED_TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Elemental Token (Prismari Pianist)", count: 2 },
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  faces: ["Invasion of Mercadia", "Kyren Flamewright"],
  transform: true,
});
