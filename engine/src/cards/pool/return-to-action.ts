import { defineCard } from "../define.js";

// EDHREC rank 7832. Supernatural Stamina's shape, plus lifelink: the granted
// dies trigger returns the card as a new object, tapped, under its owner's
// control.

export default defineCard({
  name: "Return to Action",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Until end of turn, target creature gets +1/+0 and gains lifelink and \"When this creature dies, return it to the battlefield tapped under its owner's control.\"",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
          resolve: null,
          text: "When this creature dies, return it to the battlefield tapped under its owner's control.",
        },
      },
    ],
  },
});
