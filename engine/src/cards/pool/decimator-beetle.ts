import { defineCard } from "../define.js";

// Amonkhet. The attack trigger's two targets are independent (the rulings):
// the counter goes on the opponent's creature even with none to remove, and
// an illegal one doesn't stop the other.
const ENTERS = "When this creature enters, put a -1/-1 counter on target creature you control.";
const ATTACKS =
  "Whenever this creature attacks, remove a -1/-1 counter from target creature you control and put a -1/-1 counter on up to one target creature defending player controls.";

export default defineCard({
  name: "Decimator Beetle",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 4,
  toughness: 5,
  text: `${ENTERS}\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-you-control", { kind: "optional", of: "creature-defending-player-controls" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: 0, counter: "-1/-1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "-1/-1", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
