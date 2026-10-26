import { defineCard } from "../define.js";

const TEXT = "When you cycle this card and when this creature dies, you may create a 1/1 white Soldier creature token.";
const MAKE_SOLDIER = {
  kind: "may",
  prompt: "Create a 1/1 white Soldier creature token?",
  effect: { kind: "create-token", token: "Soldier Token", count: 1 },
} as const;

// One ability with two trigger events: a cycle trigger and a dies trigger
// (the ruling), written as two entries naming each other.
export default defineCard({
  name: "Bant Sojourners",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  cycling: { cost: "{2}{W}" },
  text: `${TEXT}\nCycling {2}{W} ({2}{W}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      sameAbilityAs: 1,
      targets: [],
      effect: MAKE_SOLDIER,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: MAKE_SOLDIER,
      resolve: null,
      text: TEXT,
    },
  ],
});
