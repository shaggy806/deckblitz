import { defineCard } from "../define.js";

const TEXT =
  "{2}{B}, {T}, Sacrifice a Zombie: Destroy target non-Zombie creature. It can't be regenerated. Activate only as a sorcery.";

export default defineCard({
  name: "Deathmark Prelate",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true, sacrifice: { filter: { subtype: "Zombie" } } },
      targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Zombie"] } }],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
