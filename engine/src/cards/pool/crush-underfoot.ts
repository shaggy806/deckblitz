import { defineCard } from "../define.js";

// The Giant isn't a target: it's chosen as this resolves, and with no Giant the
// spell finishes with no effect (the rulings). A one-sided fight is its power
// dealt by it, so its deathtouch or lifelink counts.
export default defineCard({
  name: "Crush Underfoot",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["kindred", "instant"],
  subtypes: ["Giant"],
  text: "Choose a Giant creature you control. It deals damage equal to its power to target creature.",
  targets: ["creature"],
  effect: {
    kind: "choose-permanents",
    filter: { type: "creature", subtype: "Giant", controlledBy: "you" },
    min: 1,
    upTo: 1,
    keepTargets: true,
    then: { kind: "fight", a: 0, b: 1, oneSided: true },
    prompt: "Choose a Giant creature you control",
  },
});
