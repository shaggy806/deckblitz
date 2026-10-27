import { defineCard } from "../define.js";

// EDHREC rank 22251. Deathbonnet Hulk's untargeted choice from every
// graveyard as it resolves (choosing none is the "may"), then Charnel
// Troll's "if you do": a counter if a creature card was exiled, tapped if not.

const TEXT =
  "At the beginning of your upkeep, you may exile a creature card from a graveyard. If you do, put a +1/+1 counter on this creature. If you don't, tap this creature.";

export default defineCard({
  name: "Entrails Feaster",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cat"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "graveyards",
            min: 0,
            max: 1,
            filter: { type: "creature" },
            destination: "exile",
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", atLeast: 1 },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            else: { kind: "tap", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
