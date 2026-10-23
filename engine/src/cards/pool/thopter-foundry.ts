import { defineCard } from "../define.js";

const TEXT =
  "{1}, Sacrifice a nontoken artifact: Create a 1/1 blue Thopter artifact creature token with flying. You gain 1 life.";

// Thopter Foundry may be sacrificed to its own ability (the ruling).
export default defineCard({
  name: "Thopter Foundry",
  manaCost: "{W/B}{U}",
  colors: ["W", "U", "B"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { token: false, type: "artifact" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Blue Thopter Token", count: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
