import { defineCard } from "../define.js";

// EDHREC rank 272.

export default defineCard({
  name: "Force of Negation",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "If it's not your turn, you may exile a blue card from your hand rather than pay this spell's mana cost.\nCounter target noncreature spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["U"] }, text: "a blue card" }, condition: { kind: "not", of: { kind: "your-turn" } } },
  targets: ["noncreature-spell"],
  effect: { kind: "counter", target: 0, into: "exile" },
});
