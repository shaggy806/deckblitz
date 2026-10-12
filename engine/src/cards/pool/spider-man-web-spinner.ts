import { defineCard } from "../define.js";

export default defineCard({
  name: "Spider-Man, Web-Spinner",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 2,
  toughness: 3,
  keywords: ["double-strike", "haste"],
  text: "Double strike (This creature deals both first-strike and regular combat damage.)\nHaste (This creature can attack and {T} as soon as he comes under your control.)\nWhenever Spider-Man attacks, target creature can't block this turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "Whenever Spider-Man attacks, target creature can't block this turn.",
    },
  ],
});
