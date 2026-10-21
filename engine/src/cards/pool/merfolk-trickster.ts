import { defineCard } from "../define.js";

// EDHREC rank 9883. Dominaria.
//
// Rulings:
//   [2018-04-27] If the target creature has power and toughness written as */* with an ability
//     that defines its power and toughness, it's 0/0 when it loses all abilities.
//   [2018-04-27] If the target creature has an ability that triggers when it becomes tapped, that
//     ability triggers before it loses all abilities.

const TEXT =
  "When this creature enters, tap target creature an opponent controls. It loses all abilities until end of turn.";

export default defineCard({
  name: "Merfolk Trickster",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "lose-abilities", target: 0, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
