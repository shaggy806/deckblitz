import { defineCard } from "../define.js";

export default defineCard({
  name: "Vivien's Invocation",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top seven cards of your library. You may put a creature card from among them onto the battlefield. Put the rest on the bottom of your library in a random order. When a creature is put onto the battlefield this way, it deals damage equal to its power to target creature an opponent controls.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 7,
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "bottom-random",
      },
      {
        kind: "reflexive-trigger",
        about: "put-this-way",
        targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature" } }],
        effect: { kind: "damage", amount: { powerOf: "trigger-object" }, target: 0, from: "trigger-object" },
        text: "When a creature is put onto the battlefield this way, it deals damage equal to its power to target creature an opponent controls.",
      },
    ],
  },
});
