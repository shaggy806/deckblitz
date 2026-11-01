import type { CardType } from "../define.js";
import { defineCard } from "../define.js";

// One look-and-choose over the ten revealed cards with a `oneEach` rule, a
// slot per card type (rule 205.2a — the ones a card in a library can have,
// kindred among them, as Vigean Intuition's are): a card with two types
// fills either slot, and another card may fill the other (the ruling).
const CARD_TYPES: readonly CardType[] = [
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "instant",
  "kindred",
  "land",
  "planeswalker",
  "sorcery",
];

const ENTERS =
  "When Atraxa enters, reveal the top ten cards of your library. For each card type, you may put a card of that " +
  "type from among the revealed cards into your hand. Put the rest on the bottom of your library in a random " +
  "order. (Artifact, battle, creature, enchantment, instant, land, planeswalker, and sorcery are card types.)";

export default defineCard({
  name: "Atraxa, Grand Unifier",
  manaCost: "{3}{G}{W}{U}{B}",
  colors: ["G", "W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Angel"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "vigilance", "deathtouch", "lifelink"],
  text: `Flying, vigilance, deathtouch, lifelink\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 10,
        reveal: true,
        min: 0,
        max: CARD_TYPES.length,
        together: {
          oneEach: CARD_TYPES.map((type) => ({ label: `${/^[aeiou]/.test(type) ? "an" : "a"} ${type} card`, filter: { type } })),
          text: "a card of each card type",
        },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
