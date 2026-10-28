import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";

// EDHREC rank 30978. "The color of its controller's choice": the target's
// controller picks one of five fixed grants as it resolves (an
// `each-player-may` of `who: { controllerOfTarget: 0 }`).
//
// Rulings:
//   [2008-05-01] If the permanent is already untapped, you can’t activate its {Q} ability. That’s
//     because you can’t pay the “Untap this permanent” cost.
//   [2008-05-01] When you activate an {Q} ability, you untap the creature with that ability as a
//     cost. The untap can’t be responded to. (The actual ability can be responded to, of course.)
//   [2008-05-01] If a creature with an {Q} ability hasn’t been under your control since your most
//     recent turn began, you can’t activate that ability, unless the creature has haste.

const COLORS = [
  ["White", "W"],
  ["Blue", "U"],
  ["Black", "B"],
  ["Red", "R"],
  ["Green", "G"],
] as const;

const CHOICES: readonly ModeOption[] = COLORS.map(([text, color]): ModeOption => ({
  text,
  effect: { kind: "grant-protection", target: 0, from: { colors: [color] }, duration: "end-of-turn" },
}));

export default defineCard({
  name: "Pale Wayfarer",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Giant"],
  power: 4,
  toughness: 4,
  text: "{2}{W}{W}, {Q}: Target creature gains protection from the color of its controller's choice until end of turn. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{2}{W}{W}", tap: false, untap: true },
      targets: ["creature"],
      effect: { kind: "each-player-may", who: { controllerOfTarget: 0 }, choices: CHOICES },
      resolve: null,
      text: "{2}{W}{W}, {Q}: Target creature gains protection from the color of its controller's choice until end of turn.",
    },
  ],
});
