import { defineCard } from "../define.js";

// Rulings:
//   [2006-05-01] If you cast a green and blue creature spell, both abilities will trigger. The
//     abilities may be stacked so that when they resolve, you search your library for a creature
//     card, put it on top of your library, and then put that card into your hand. The abilities
//     may also be stacked in the other order, of course.

const GREEN =
  "Whenever you cast a green creature spell, you may search your library for a creature card, reveal it, then shuffle and put that card on top.";
const BLUE =
  "Whenever you cast a blue creature spell, reveal the top card of your library. If it's a creature card, put that card into your hand.";

export default defineCard({
  name: "Momir Vig, Simic Visionary",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${GREEN}\n${BLUE}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", colors: ["G"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a creature card and put it on top?",
        effect: {
          kind: "search-library",
          filter: { type: "creature" },
          destination: "library-top",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: GREEN,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", colors: ["U"] } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: BLUE,
    },
  ],
});
