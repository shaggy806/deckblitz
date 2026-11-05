import { defineCard } from "../define.js";
import { enlist } from "../helpers.js";

const TEXT =
  "Whenever this creature attacks, look at the top X cards of your library, where X is this creature's power. You may exile an instant or sorcery card with mana value X or less from among them. Put the rest on the bottom of your library in a random order. You may cast the exiled card without paying its mana cost.";

export default defineCard({
  name: "Keldon Flamesage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 3,
  text: `Enlist\n${TEXT}`,
  static: [enlist()],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { powerOf: "source" },
        min: 0,
        max: 1,
        filter: {
          typesAnyOf: ["instant", "sorcery"],
          manaValue: { op: "lte", n: { amount: { powerOf: "source" } } },
        },
        destination: "exile",
        unlinked: true,
        leftover: "bottom-random",
        then: { kind: "cast-now", target: 0, free: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
