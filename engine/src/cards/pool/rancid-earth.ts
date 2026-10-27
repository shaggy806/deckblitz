import { defineCard } from "../define.js";

// Torment. EDHREC rank 24029. Toxic Stench's threshold shape, read as it
// resolves (rule 702.27): with threshold the land is destroyed and then 1
// damage is dealt to each creature and each player at once.

export default defineCard({
  name: "Rancid Earth",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target land.\nThreshold — If there are seven or more cards in your graveyard, instead destroy that land and Rancid Earth deals 1 damage to each creature and each player.",
  targets: ["land"],
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
            { kind: "damage", amount: 1, who: "each-player" },
          ],
        },
      ],
    },
    else: { kind: "destroy", target: 0 },
  },
});
