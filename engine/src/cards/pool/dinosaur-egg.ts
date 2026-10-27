import { defineCard } from "../define.js";
import { evolve } from "../helpers.js";

export default defineCard({
  name: "Dinosaur Egg",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Egg"],
  power: 0,
  toughness: 3,
  text: "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)\nWhen this creature dies, you may discover X, where X is its toughness.",
  triggered: [
    evolve(),
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // "Its toughness": as it last existed on the battlefield (rule 608.2h).
      effect: {
        kind: "may",
        prompt: "Discover X, where X is Dinosaur Egg's toughness?",
        effect: { kind: "discover", amount: { toughnessOf: "trigger-object" } },
      },
      resolve: null,
      text: "When this creature dies, you may discover X, where X is its toughness.",
    },
  ],
});
