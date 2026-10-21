import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature mutates, it deals 4 damage to target creature or planeswalker an opponent controls and you gain 4 life.";

// With its target illegal, the ability doesn't resolve and no life is
// gained (the ruling).
export default defineCard({
  name: "Snapdax, Apex of the Hunt",
  manaCost: "{1}{R}{W}{B}",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Cat", "Nightmare"],
  power: 3,
  toughness: 5,
  keywords: ["double-strike"],
  mutate: "{2}{B/R}{W}{W}",
  text: `Mutate {2}{B/R}{W}{W} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nDouble strike\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 4, target: 0 },
          { kind: "gain-life", amount: 4 },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
