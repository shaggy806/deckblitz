import { defineCard } from "../define.js";

// EDHREC rank 9880.
const CHAPTER_I = "I — Create two 1/1 white Ally creature tokens.";
const CHAPTER_II =
  "II — Search your library for a Mountain or Cave card, reveal it, put it into your hand, then shuffle.";
const CHAPTER_III =
  "III — Earthbend 3. (Target land you control becomes a 0/0 creature with haste that's still a land. Put three +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)";

export default defineCard({
  name: "The Cave of Two Lovers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Ally Token", count: 2 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtypes: ["Mountain", "Cave"] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: ["land-you-control"],
      effect: { kind: "earthbend", target: 0, amount: 3 },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
