import { defineCard } from "../define.js";

// EDHREC rank 11803 (back face). Heart-Piercer Manticore's "you may sacrifice
// another … When you do"; the excess goes to the creature's controller through
// the damage's `excessToController`, whose `then` converts Megatron once the
// damage is dealt (B308 — the card's ruling: simultaneously, then converts).
const ATTACKS =
  "Whenever Megatron attacks, you may sacrifice another artifact. When you do, Megatron deals damage equal to the sacrificed artifact's mana value to target creature. If excess damage would be dealt to that creature this way, instead that damage is dealt to that creature's controller and you convert Megatron.";

export default defineCard({
  name: "Megatron, Destructive Force",
  art: "https://cards.scryfall.io/art_crop/back/a/c/ac6ded62-7bf2-476f-ad8e-020da6327c6b.jpg",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 5,
  text: `Living metal (During your turn, this Vehicle is also a creature.)\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, exceptSource: true, text: "Sacrifice another artifact" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          value: { manaValueOf: { paid: "sacrificed" } },
          effect: {
            kind: "damage",
            target: 0,
            amount: { triggerValue: true },
            excessToController: { then: { kind: "transform", target: "source" } },
          },
          text: "When you do, Megatron deals damage equal to the sacrificed artifact's mana value to target creature. If excess damage would be dealt to that creature this way, instead that damage is dealt to that creature's controller and you convert Megatron.",
        },
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      addTypes: ["creature"],
      text: "Living metal",
    },
  ],
  faces: ["Megatron, Tyrant", "Megatron, Destructive Force"],
  transform: true,
});
