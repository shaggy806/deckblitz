import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature mutates, you may cast target noncreature card with mana value 3 or less from your graveyard without paying its mana cost.";

// Cast while the ability resolves, timing ignored, or not at all; no
// alternative costs, X is 0 (the rulings). A land can be targeted but not
// cast, so nothing is offered for one.
export default defineCard({
  name: "Vadrok, Apex of Thunder",
  manaCost: "{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Dinosaur", "Cat"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "first-strike"],
  mutate: "{1}{W/U}{R}{R}",
  text: `Mutate {1}{W/U}{R}{R} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nFlying, first strike\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["creature"], manaValue: { op: "lte", n: 3 } } },
      ],
      effect: { kind: "cast-now", target: 0, free: true },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
