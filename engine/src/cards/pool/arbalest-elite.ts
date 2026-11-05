import { defineCard } from "../define.js";

// EDHREC rank 24693.

export default defineCard({
  name: "Arbalest Elite",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 2,
  toughness: 3,
  text: "{2}{W}, {T}: This creature deals 3 damage to target attacking or blocking creature. This creature doesn't untap during your next untap step.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: ["attacking-or-blocking-creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          {
            kind: "tap",
            target: "source",
            doesntUntapNext: true,
            onlyDoesntUntap: true,
            untapStepOf: "you",
          },
        ],
      },
      resolve: null,
      text: "{2}{W}, {T}: This creature deals 3 damage to target attacking or blocking creature. This creature doesn't untap during your next untap step.",
    },
  ],
});
