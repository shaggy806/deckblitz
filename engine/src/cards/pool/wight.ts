import { defineCard } from "../define.js";

const TEXT =
  "Life Drain — Whenever a creature dealt damage by this creature this turn dies, create a tapped 2/2 black Zombie creature token and exile that card.";

export default defineCard({
  name: "Wight",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 3,
  toughness: 2,
  text: `This creature enters tapped.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Zombie Token", count: 1, tapped: true },
          { kind: "exile", target: "trigger-object" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
