import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// Rulings:
//   If the top ten cards of your library don't contain all ten color pairs, you choose as many
//     cards as you can and put those cards into your hand.
//   A "color pair" is exactly two colors.

const TEXT =
  "When Niv-Mizzet enters, reveal the top ten cards of your library. For each color pair, choose a card that's exactly those colors from among them. Put the chosen cards into your hand and the rest on the bottom of your library in a random order.";

const NAMES: Record<Color, string> = { W: "white", U: "blue", B: "black", R: "red", G: "green" };
const PAIRS: readonly (readonly [Color, Color])[] = [
  ["W", "U"],
  ["W", "B"],
  ["U", "B"],
  ["U", "R"],
  ["B", "R"],
  ["B", "G"],
  ["R", "G"],
  ["R", "W"],
  ["G", "W"],
  ["G", "U"],
];

export default defineCard({
  name: "Niv-Mizzet Reborn",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // One card a slot, and as many slots filled as can be: a set that can fill only
      // so many can't be required to be bigger, so `min` is every pair.
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 10,
        reveal: true,
        min: 10,
        max: 10,
        together: {
          oneEach: PAIRS.map(([a, b]) => ({
            label: `a ${NAMES[a]}-${NAMES[b]} card`,
            filter: { colors: [a, b], colorCount: 2 },
          })),
          text: "a card that's exactly each color pair",
        },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
