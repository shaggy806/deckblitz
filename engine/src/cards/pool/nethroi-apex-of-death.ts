import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature mutates, return any number of target creature cards with total power 10 or less from your graveyard to the battlefield.";

// The total is of the cards' powers in the graveyard, checked as they're
// targeted and again on resolution, when a total over 10 makes every target
// illegal (the rulings). They return as one event.
export default defineCard({
  name: "Nethroi, Apex of Death",
  manaCost: "{2}{W}{B}{G}",
  colors: ["W", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Nightmare", "Beast"],
  power: 5,
  toughness: 5,
  keywords: ["deathtouch", "lifelink"],
  mutate: "{4}{G/W}{B}{B}",
  text: `Mutate {4}{G/W}{B}{B} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nDeathtouch, lifelink\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
          maxTotalPower: 10,
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
