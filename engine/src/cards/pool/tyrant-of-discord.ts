import { defineCard } from "../define.js";

const ENTERS =
  "When this creature enters, target opponent chooses a permanent they control at random and sacrifices it. If a nonland permanent is sacrificed this way, repeat this process.";

// Repeating doesn't target again, and it goes on until a land is sacrificed —
// or nothing is, as when that player can't sacrifice (the rulings).
export default defineCard({
  name: "Tyrant of Discord",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "repeat",
        effect: {
          kind: "choose-permanents",
          random: true,
          filter: {},
          controlledByPlayer: { target: 0 },
          upTo: 1,
          prompt: "A permanent that player controls, at random",
          then: { kind: "sacrifice-target", target: 0, byItsController: true },
        },
        again: { kind: "this-way", what: "sacrificed", filter: { notTypes: ["land"] } },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
