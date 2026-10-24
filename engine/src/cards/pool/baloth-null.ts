import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 22012. Fight On!'s effect on an enters trigger.

const TEXT = "When this creature enters, return up to two target creature cards from your graveyard to your hand.";

export default defineCard({
  name: "Baloth Null",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Beast"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
