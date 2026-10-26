import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

// EDHREC rank 26911.

const TEXT = "{T}: This creature deals 1 damage to target attacking or blocking Spirit.";

export default defineCard({
  name: "Takeno's Cavalry",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Samurai", "Archer"],
  power: 1,
  toughness: 1,
  text: `Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", subtype: "Spirit", anyOf: [{ attacking: true }, { blocking: true }] },
        },
      ],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
  triggered: [...bushido(1)],
});
