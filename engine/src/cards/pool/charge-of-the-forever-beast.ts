import { defineCard } from "../define.js";

// EDHREC rank 25782. Exactly one card revealed, as a mandatory additional
// cost (the ruling); its power is read in the hand, or as it was just before
// it left (the ruling — `{ powerOf: { paid: "revealed" } }`).

const COST = "As an additional cost to cast this spell, reveal a creature card from your hand.";
const TEXT =
  "Charge of the Forever-Beast deals damage to target creature or planeswalker equal to the revealed card's power.";

export default defineCard({
  name: "Charge of the Forever-Beast",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${COST}\n${TEXT}`,
  additionalCost: { behold: { filter: { type: "creature" }, text: "a creature card", fromHand: true } },
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", target: 0, amount: { powerOf: { paid: "revealed" } } },
});
