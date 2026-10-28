import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";

// EDHREC rank 23379. "The color of its controller's choice": the target's
// controller picks one of five fixed grants as it resolves (an
// `each-player-may` of `who: { controllerOfTarget: 0 }`), whoever activated it.

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
  name: "Wishmonger",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Unicorn", "Monger"],
  power: 3,
  toughness: 3,
  text: "{2}: Target creature gains protection from the color of its controller's choice until end of turn. Any player may activate this ability.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature"],
      effect: { kind: "each-player-may", who: { controllerOfTarget: 0 }, choices: CHOICES },
      resolve: null,
      text: "{2}: Target creature gains protection from the color of its controller's choice until end of turn. Any player may activate this ability.",
      anyPlayer: true,
    },
  ],
});
