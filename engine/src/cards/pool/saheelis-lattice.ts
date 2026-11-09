import { defineCard } from "../define.js";

// EDHREC rank 15115. Front face; the back reads the cards used to craft it.
export default defineCard({
  name: "Saheeli's Lattice",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: "When this artifact enters, you may discard a card. If you do, draw two cards.\nCraft with one or more Dinosaurs {4}{R} ({4}{R}, Exile this artifact, Exile one or more Dinosaurs you control and/or Dinosaur cards from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)",
  activated: [
    {
      cost: {
        mana: "{4}{R}",
        tap: false,
        do: { kind: "exile", target: "source" },
        craft: { count: 1, orMore: true, filter: { subtype: "Dinosaur" }, text: "one or more Dinosaurs" },
      },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "craft-return" },
      resolve: null,
      text: "Craft with one or more Dinosaurs {4}{R}",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw two cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 2 } },
          ],
        },
      },
      resolve: null,
      text: "When this artifact enters, you may discard a card. If you do, draw two cards.",
    },
  ],
  faces: ["Saheeli's Lattice", "Mastercraft Raptor"],
  transform: true,
});
