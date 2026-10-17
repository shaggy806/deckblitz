import { defineCard } from "../define.js";

const DIES_TEXT =
  "When a legendary creature an opponent controls dies, put The Balrog on the bottom of its owner's library.";

// Ruling: it goes only if it's still on the battlefield as the ability
// resolves — not from another zone (dying alongside the legend, it stays in
// the graveyard), nor as a new object that has returned since (rule 400.7):
// `source-on-battlefield`.
export default defineCard({
  name: "The Balrog, Flame of Udûn",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Demon"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "opponent", filter: { type: "creature", supertype: "legendary" } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: { kind: "put-on-library", target: "source", position: "bottom" },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
