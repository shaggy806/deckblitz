import { defineCard } from "../define.js";

// X is read after the counter goes on — from last-known information if
// Wilfred has left the battlefield by then (the ruling, rule 608.2h), when
// the counter can't be put on and X is what he last had.
const STARS_TEXT =
  "Look to the Stars — At the beginning of your upkeep, put a time counter on Wilfred Mott. Then look at the top X cards of your library, where X is the number of time counters on Wilfred Mott. You may put a nonland permanent card with mana value 3 or less from among them onto the battlefield. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Wilfred Mott",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  text: STARS_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "time", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "library",
            count: { countersOn: "source", counter: "time" },
            min: 0,
            max: 1,
            filter: {
              typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
              notTypes: ["land"],
              manaValue: { op: "lte", n: 3 },
            },
            destination: "battlefield",
            leftover: "bottom-random",
          },
        ],
      },
      resolve: null,
      text: STARS_TEXT,
    },
  ],
});
