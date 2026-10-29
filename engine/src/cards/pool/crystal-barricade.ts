import { defineCard } from "../define.js";

// Ruling: the damage to your other creatures is prevented even when the
// damage dealt to Crystal Barricade at the same time is lethal — a static
// replacement applies to the whole simultaneous event.

export default defineCard({
  name: "Crystal Barricade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\nYou have hexproof. (You can't be the target of spells or abilities your opponents control.)\nPrevent all noncombat damage that would be dealt to other creatures you control.",
  static: [
    {
      affects: { scope: "self" },
      playerHexproof: true,
      text: "You have hexproof. (You can't be the target of spells or abilities your opponents control.)",
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: false,
        prevent: true,
        toFilter: { type: "creature", controlledBy: "you" },
        toOther: true,
      },
      text: "Prevent all noncombat damage that would be dealt to other creatures you control.",
    },
  ],
});
