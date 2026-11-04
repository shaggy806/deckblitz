import { defineCard } from "../define.js";

// EDHREC rank 25564.
//
// Rulings:
//   [2021-11-19] Skulking Killer's ability triggers even if all your opponents control more than
//     one creature. If the targeted creature's controller controls any other creatures as the
//     ability resolves, the ability won't do anything. Notably, that player could cast a creature
//     spell with flash or create a creature token in response to avoid the -2/-2 effect.

export default defineCard({
  name: "Skulking Killer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Assassin"],
  power: 4,
  toughness: 2,
  text: "When this creature enters, target creature an opponent controls gets -2/-2 until end of turn if that opponent controls no other creatures.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      // Read as it resolves (the ruling): a creature that arrived in response
      // stops it.
      effect: {
        kind: "conditional",
        condition: {
          kind: "of-player",
          player: { controllerOfTarget: 0 },
          condition: { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1, excludeTarget: 0 } },
        },
        then: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      },
      resolve: null,
      text: "When this creature enters, target creature an opponent controls gets -2/-2 until end of turn if that opponent controls no other creatures.",
    },
  ],
});
