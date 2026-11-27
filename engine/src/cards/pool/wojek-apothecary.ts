import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). Radiance: the target, and each other
// creature that shares a color with it — the target's colors as the ability
// resolves (608.2h), each other creature's as damage would be dealt to it
// (rule 611.2c) — each with a shield of 1 of its own (rule 615.7). The target
// matches itself (`sharesColorWith`), whatever its colors.

const TEXT =
  "Radiance — {T}: Prevent the next 1 damage that would be dealt to target creature and each other creature that shares a color with it this turn.";

export default defineCard({
  name: "Wojek Apothecary",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "damage-rule",
        to: { permanents: { type: "creature", sharesColorWith: 0 } },
        amount: 1,
        eachRecipient: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
