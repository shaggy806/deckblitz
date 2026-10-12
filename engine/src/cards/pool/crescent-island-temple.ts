import { defineCard } from "../define.js";

// EDHREC rank 7799.
// Makes Monk → new token "Monk Token (Crescent Island Temple)" (scaffolded).

export default defineCard({
  name: "Crescent Island Temple",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Shrine"],
  text: "When Crescent Island Temple enters, for each Shrine you control, create a 1/1 red Monk creature token with prowess. (Whenever you cast a noncreature spell, it gets +1/+1 until end of turn.)\nWhenever another Shrine you control enters, create a 1/1 red Monk creature token with prowess.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Counted as it resolves, this Shrine included.
      effect: {
        kind: "create-token",
        token: "Monk Token (Crescent Island Temple)",
        count: { countOf: { subtype: "Shrine", controlledBy: "you" } },
      },
      resolve: null,
      text: "When Crescent Island Temple enters, for each Shrine you control, create a 1/1 red Monk creature token with prowess.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Shrine" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Monk Token (Crescent Island Temple)", count: 1 },
      resolve: null,
      text: "Whenever another Shrine you control enters, create a 1/1 red Monk creature token with prowess.",
    },
  ],
});
