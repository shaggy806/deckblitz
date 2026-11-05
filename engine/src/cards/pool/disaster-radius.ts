import { defineCard } from "../define.js";

// EDHREC rank 17383.
export default defineCard({
  name: "Disaster Radius",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, reveal a creature card from your hand.\nDisaster Radius deals X damage to each creature your opponents control, where X is the revealed card's mana value.",
  additionalCost: { behold: { filter: { type: "creature" }, text: "a creature card", fromHand: true } },
  effect: {
    kind: "damage-all",
    filter: { type: "creature", controlledBy: "opponent" },
    amount: { manaValueOf: "revealed" },
  },
});
