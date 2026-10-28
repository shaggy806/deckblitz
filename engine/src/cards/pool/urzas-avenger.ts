import { defineCard } from "../define.js";

// EDHREC rank 27305.
//
// Rulings:
//   [2004-10-04] The -1/-1 is not permanent. It lasts until the end of the turn as do the
//     abilities that are granted.

export default defineCard({
  name: "Urza's Avenger",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 4,
  toughness: 4,
  text: "{0}: This creature gets -1/-1 and gains your choice of banding, flying, first strike, or trample until end of turn. (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      // The keyword is chosen as it resolves (Lunar Avenger's shape); each
      // choice carries the -1/-1.
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Banding",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: "source", power: -1, toughness: -1, duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "banding", duration: "end-of-turn" },
              ],
            },
          },
          {
            text: "Flying",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: "source", power: -1, toughness: -1, duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
              ],
            },
          },
          {
            text: "First strike",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: "source", power: -1, toughness: -1, duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
              ],
            },
          },
          {
            text: "Trample",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: "source", power: -1, toughness: -1, duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "{0}: This creature gets -1/-1 and gains your choice of banding, flying, first strike, or trample until end of turn.",
    },
  ],
});
