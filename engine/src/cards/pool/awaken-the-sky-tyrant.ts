import { defineCard } from "../define.js";

const TEXT =
  "When a source an opponent controls deals damage to you, sacrifice this enchantment. If you do, create a 5/5 red Dragon creature token with flying.";

export default defineCard({
  name: "Awaken the Sky Tyrant",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "opponent", to: "you" },
      targets: [],
      // It triggers once per source, but only one trigger can sacrifice it
      // (the ruling): the rest find it gone and make nothing.
      effect: {
        kind: "sacrifice-source",
        then: { kind: "create-token", token: "Dragon Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
