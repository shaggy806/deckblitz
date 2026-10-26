import { defineCard } from "../define.js";

// The ruling: it targets a permanent (not a card in a graveyard) with at least
// one of the three creature types — any permanent, not only a creature.
export default defineCard({
  name: "Undead Slayer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "{W}, {T}: Exile target Skeleton, Vampire, or Zombie.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "permanent", filter: { subtypes: ["Skeleton", "Vampire", "Zombie"] } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{W}, {T}: Exile target Skeleton, Vampire, or Zombie.",
    },
  ],
});
