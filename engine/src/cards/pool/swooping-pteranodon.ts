import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// Rulings:
//   - Swooping Pteranodon's triggered ability targets only the creature an opponent controls. You
//     choose the target land (where the poor creature is going to drop) as the delayed triggered
//     ability triggers at the beginning of the next end step.
//
// The delayed ability chooses its own target as it's put on the stack (rule 603.3d — `DelayedAt`'s
// `targets`); "that creature" is the stolen one, remembered as it was set up and acted on only in
// that stint (rule 603.7c). The land is the damage's source (Soul's Fire's `from`).

const TEXT =
  "Whenever this creature or another Dinosaur you control with flying enters, gain control of target creature an opponent controls until end of turn. Untap that creature. It gains flying and haste until end of turn. At the beginning of the next end step, target land deals 3 damage to that creature.";

const STEAL: Omit<TriggeredAbility, "trigger"> = {
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { step: "end", targets: [{ kind: "permanent", filter: { type: "land" } }] },
        remember: { stolen: { set: { targets: [0] } } },
        effect: { kind: "damage", amount: 3, target: { remembered: "stolen" }, from: 0 },
        text: "At the beginning of the next end step, target land deals 3 damage to that creature.",
      },
    ],
  },
  resolve: null,
  text: TEXT,
};

export default defineCard({
  name: "Swooping Pteranodon",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${TEXT}`,
  triggered: [
    { ...STEAL, trigger: { on: "enters-battlefield", who: "self" } },
    {
      ...STEAL,
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        otherOnly: true,
        filter: { subtype: "Dinosaur", keyword: "flying" },
      },
      sameAbilityAs: 0,
    },
  ],
});
