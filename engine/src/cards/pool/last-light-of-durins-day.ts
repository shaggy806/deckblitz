import { defineCard } from "../define.js";
import { searchZonesAndOr } from "../helpers.js";

// "Your hand and/or library": the player's choice of zones as it resolves, only
// a search of the library shuffling. A Dragon card that isn't a permanent card
// stays where it was (rule 400.4a, the ruling).

const TRIGGER =
  "Whenever a Mountain you control enters, put a quest counter on this enchantment. If it has six or more quest counters on it, sacrifice it. If you do, search your hand and/or library for a Dragon card and put it onto the battlefield. If you search your library this way, shuffle.";

export default defineCard({
  name: "Last Light of Durin's Day",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  cycling: { cost: "{2}", search: { subtype: "Mountain" } },
  text: `${TRIGGER}\nMountaincycling {2} ({2}, Discard this card: Search your library for a Mountain card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Mountain" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 6 } },
            then: {
              kind: "sacrifice-source",
              then: searchZonesAndOr(["hand", "library"], {
                kind: "search-library",
                filter: { subtype: "Dragon" },
                destination: "battlefield",
                min: 0,
                max: 1,
              }),
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
