import { defineCard } from "../define.js";

const FLAMES_TEXT = "I, II — Rising Flames — Phoenix deals 2 damage to each opponent.";
const REBIRTH_TEXT =
  "III — Flames of Rebirth — Return any number of target creature cards with total mana value 6 or less from your graveyard to the battlefield. Exile Phoenix, then return it to the battlefield (front face up).";

export default defineCard({
  name: "Phoenix, Warden of Fire",
  art: "https://cards.scryfall.io/art_crop/back/4/5/457fdbb9-5439-460f-8e37-176f8919362c.jpg",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Phoenix"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${FLAMES_TEXT}\n${REBIRTH_TEXT}\nFlying, lifelink`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: FLAMES_TEXT,
    },
    {
      at: [3],
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
          maxTotalManaValue: 6,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "put-onto-battlefield", target: 0 } },
          { kind: "flicker", target: "source" },
        ],
      },
      resolve: null,
      text: REBIRTH_TEXT,
    },
  ],
  faces: ["Joshua, Phoenix's Dominant", "Phoenix, Warden of Fire"],
  transform: true,
});
