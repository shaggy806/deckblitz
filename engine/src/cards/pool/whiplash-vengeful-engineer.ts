import { defineCard } from "../define.js";

const TEXT =
  "Whenever Whiplash attacks, if he's equipped, each opponent loses X life and you gain X life, where X is the number of Equipment attached to him.";

// EDHREC rank 18630.
const COUNT = { countOf: { subtype: "Equipment", wasAttachedTo: "source" } } as const;

export default defineCard({
  name: "Whiplash, Vengeful Engineer",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Villain"],
  power: 2,
  toughness: 2,
  text: `Whiplash enters tapped.\n${TEXT}`,
  static: [
    { affects: { scope: "self" }, replacement: { event: "enters-battlefield", tapped: true }, text: "Whiplash enters tapped." },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: COUNT, who: "each-opponent" },
          { kind: "gain-life", amount: COUNT },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
