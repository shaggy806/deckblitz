import { defineCard } from "../define.js";

// The back face of Terra, Magical Adept. "If it's a Saga, put up to three
// lore counters on it" is a number chosen as the chapter resolves (rule
// 608.2d; `choose-value`), asked only when the token is a Saga, and the
// counters go on the token this made (`thisWay: "created"`); each one added
// can trigger its chapters (714.2b). "Return it to the battlefield" with no
// "transformed" puts it back front face up (712.14).
const COPY_TEXT =
  "I, II, III — Create a token that's a copy of target nonlegendary enchantment you control. It gains haste. If it's a Saga, put up to three lore counters on it. Sacrifice it at the beginning of your next end step.";
const MANA_TEXT =
  "IV — Add {W}{W}, {U}{U}, {B}{B}, {R}{R}, and {G}{G}. Exile Esper Terra, then return it to the battlefield (front face up).";

export default defineCard({
  name: "Esper Terra",
  art: "https://cards.scryfall.io/art_crop/back/f/b/fbd447aa-588d-4c4d-925e-a7d3bdf6a65c.jpg",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Wizard"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${COPY_TEXT}\n${MANA_TEXT}\nFlying`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [{ kind: "permanent", whose: "you", filter: { type: "enchantment", notSupertype: "legendary" } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token-copy",
            of: 0,
            count: 1,
            who: "you",
            gains: { keywords: ["haste"] },
            sacrificeAtEndStep: true,
            atYourNextEndStep: true,
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "created", filter: { subtype: "Saga" } },
            then: {
              kind: "choose-value",
              value: "number",
              min: 0,
              max: 3,
              then: {
                kind: "add-counter-all",
                filter: { thisWay: "created", subtype: "Saga" },
                counter: "lore",
                amount: "x",
              },
            },
          },
        ],
      },
      resolve: null,
      text: COPY_TEXT,
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: "W", amount: 2 },
          { kind: "add-mana", mana: "U", amount: 2 },
          { kind: "add-mana", mana: "B", amount: 2 },
          { kind: "add-mana", mana: "R", amount: 2 },
          { kind: "add-mana", mana: "G", amount: 2 },
          { kind: "flicker", target: "source" },
        ],
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  faces: ["Terra, Magical Adept", "Esper Terra"],
  transform: true,
});
