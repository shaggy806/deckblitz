import { defineCard } from "../define.js";

// Mystery Booster Commander. Riverchurn Monument's "any number of target
// players each mill", X read as it resolves.
const TEXT =
  "Landfall — Whenever a land you control enters, any number of target players each mill X cards, where X is twice the number of Crabs, Lobsters, Nautiluses, Starfish, and/or Trilobites you control.";

export default defineCard({
  name: "Homer, the Hermit",
  manaCost: "{B}{G}{U}",
  colors: ["B", "G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Crab", "Druid"],
  power: 0,
  toughness: 9,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [{ kind: "any-number", of: "player" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: {
          kind: "mill",
          target: 0,
          amount: {
            countOf: { subtypes: ["Crab", "Lobster", "Nautilus", "Starfish", "Trilobite"], controlledBy: "you" },
            times: 2,
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
