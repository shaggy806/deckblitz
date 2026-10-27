import { defineCard } from "../define.js";

// EDHREC rank 32211.

const TEXT =
  "Whenever this creature becomes blocked, you may return target card named Groffskithur from your graveyard to your hand.";

export default defineCard({
  name: "Groffskithur",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { name: "Groffskithur" } }],
      effect: {
        kind: "may",
        prompt: "Return the targeted Groffskithur from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
