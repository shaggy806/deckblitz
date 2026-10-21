import { defineCard } from "../define.js";

// EDHREC rank 23027.
//
// Rulings:
//   [2020-06-23] The value of X is determined only as Alpine Houndmaster's last ability resolves.
//     Once that happens, the value of X won't change later in the turn even if the number of
//     attacking creatures changes.
//
// "A card named Alpine Watchdog and/or a card named Igneous Cur": one find per
// name slot (Krosan Verge's `together.oneEach`), either of which may be missed.

const ENTERS =
  "When this creature enters, you may search your library for a card named Alpine Watchdog and/or a card named Igneous Cur, reveal them, put them into your hand, then shuffle.";
const ATTACKS =
  "Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the number of other attacking creatures.";

export default defineCard({
  name: "Alpine Houndmaster",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${ENTERS}\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Alpine Watchdog and/or a card named Igneous Cur?",
        effect: {
          kind: "search-library",
          filter: { anyOf: [{ name: "Alpine Watchdog" }, { name: "Igneous Cur" }] },
          destination: "hand",
          reveal: true,
          min: 0,
          max: 2,
          together: {
            oneEach: [
              { label: "a card named Alpine Watchdog", filter: { name: "Alpine Watchdog" } },
              { label: "a card named Igneous Cur", filter: { name: "Igneous Cur" } },
            ],
          },
        },
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "creature", attacking: true }, excludeSelf: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
