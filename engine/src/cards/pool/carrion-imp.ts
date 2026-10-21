import { defineCard } from "../define.js";

// Ravnica Allegiance. Boneclad Necromancer's optional exile: the target is
// chosen as the trigger goes on the stack, the "may" answered as it resolves,
// and the life comes only if the card was exiled.
const TEXT =
  "When this creature enters, you may exile target creature card from a graveyard. If you do, you gain 2 life.";

export default defineCard({
  name: "Carrion Imp",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Exile target creature card from a graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: { kind: "gain-life", amount: 2 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
