import { defineCard } from "../define.js";

// Back face of Soundwave, Sonic Spy. Its rulings: zero is even, and a spell's
// {X} counts as chosen. The token comes only if Soundwave did convert.

const ODD_TEXT =
  "Whenever you cast a spell with an odd mana value, convert Soundwave. If you do, create Ravage, a legendary 3/3 black Robot artifact creature token with menace and deathtouch.";
const EVEN_TEXT =
  "Whenever you cast a spell with an even mana value, convert Soundwave. If you do, create Laserbeak, a legendary 2/2 blue Robot artifact creature token with flying and hexproof.";

export default defineCard({
  name: "Soundwave, Superior Captain",
  art: "https://cards.scryfall.io/art_crop/back/8/7/8733cd6f-37e1-4e3a-bb25-7a238f04657e.jpg",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${ODD_TEXT}\n${EVEN_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValueParity: "odd" } },
      targets: [],
      effect: {
        kind: "transform",
        target: "source",
        then: { kind: "create-token", token: "Ravage Token", count: 1 },
      },
      resolve: null,
      text: ODD_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValueParity: "even" } },
      targets: [],
      effect: {
        kind: "transform",
        target: "source",
        then: { kind: "create-token", token: "Laserbeak Token", count: 1 },
      },
      resolve: null,
      text: EVEN_TEXT,
    },
  ],
  faces: ["Soundwave, Sonic Spy", "Soundwave, Superior Captain"],
  transform: true,
});
