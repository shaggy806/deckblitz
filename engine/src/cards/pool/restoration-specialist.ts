import { defineCard } from "../define.js";

// Two optional slots (Reconstruct History's shape): an artifact enchantment
// card may be chosen for both (rule 115.3), and the ability may be activated
// with no targets at all (its ruling). The two return together.
const SAC =
  "{W}, Sacrifice this creature: Return up to one target artifact card and up to one target enchantment card from your graveyard to your hand.";

export default defineCard({
  name: "Restoration Specialist",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 2,
  toughness: 1,
  text: SAC,
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: [
        { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } } },
        { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "enchantment" } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      resolve: null,
      text: SAC,
    },
  ],
});
