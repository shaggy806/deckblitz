import { defineCard } from "../define.js";

// EDHREC rank 12482.
//
// "Choose a creature you control or reveal a creature card from your hand" is
// what behold a creature means (rule 701.4a), here a mandatory additional
// cost. The damage is the power of what was beheld (`{ paid: "beheld" }`): a
// chosen creature's as the spell resolves, or as it last existed on the
// battlefield if it has left (the ruling); a revealed card's as it was in
// the hand.

const COST =
  "As an additional cost to cast this spell, choose a creature you control or reveal a creature card from your hand.";
const TEXT =
  "Monstrous Emergence deals damage equal to the power of the creature you chose or the card you revealed to target creature.";

export default defineCard({
  name: "Monstrous Emergence",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${COST}\n${TEXT}`,
  additionalCost: { behold: { filter: { type: "creature" }, text: "a creature" } },
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { powerOf: { paid: "beheld" } } },
});
