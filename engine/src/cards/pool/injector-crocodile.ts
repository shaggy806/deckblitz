import { defineCard } from "../define.js";

// EDHREC rank 18105.

const DIES_TEXT = "When this creature dies, incubate 3.";

export default defineCard({
  name: "Injector Crocodile",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Crocodile"],
  power: 5,
  toughness: 5,
  cycling: { cost: "{2}", search: { subtype: "Swamp" } },
  text: `${DIES_TEXT} (Create an Incubator token with three +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)\nSwampcycling {2} ({2}, Discard this card: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: 3 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
