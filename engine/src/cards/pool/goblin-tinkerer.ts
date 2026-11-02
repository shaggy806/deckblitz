import { defineCard } from "../define.js";

const TEXT =
  "{R}, {T}: Destroy target artifact. That artifact deals damage equal to its mana value to this creature.";

// The artifact deals it whether or not it was destroyed, as it last existed if it
// has gone (rule 608.2h): an indestructible one still hits back.
export default defineCard({
  name: "Goblin Tinkerer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: ["artifact"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "damage", amount: { manaValueOf: 0 }, target: "source", from: { target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
