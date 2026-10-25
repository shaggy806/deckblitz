import { defineCard } from "../define.js";

// EDHREC rank 29736. Alliances. Each cost sacrifices two different
// permanents (Jarad's "a Swamp and a Forest" shape); the Drone itself may be
// the creature.

export default defineCard({
  name: "Viscerid Drone",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homarid", "Drone"],
  power: 1,
  toughness: 2,
  text: "{T}, Sacrifice a creature and a Swamp: Destroy target nonartifact creature. It can't be regenerated.\n{T}, Sacrifice a creature and a snow Swamp: Destroy target creature. It can't be regenerated.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { each: [{ type: "creature" }, { type: "land", subtype: "Swamp" }] } },
      targets: ["nonartifact-creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "{T}, Sacrifice a creature and a Swamp: Destroy target nonartifact creature. It can't be regenerated.",
    },
    {
      cost: {
        mana: null,
        tap: true,
        sacrifice: { each: [{ type: "creature" }, { type: "land", subtype: "Swamp", supertype: "snow" }] },
      },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "{T}, Sacrifice a creature and a snow Swamp: Destroy target creature. It can't be regenerated.",
    },
  ],
});
