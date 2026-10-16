import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 12153.
//
// "Whenever you gain or lose life" is one ability with two trigger events, written as
// two entries that share their once-a-turn (`sameAbilityAs`). "During your turn" is
// part of the trigger condition (`whileCondition`), so a gain on an opponent's turn
// neither triggers it nor uses the turn's one trigger. The Bats are the ones you
// control as it resolves (rule 611.2c).
const TEXT =
  "Whenever you gain or lose life during your turn, Bats you control get +1/+0 and gain deathtouch until end of turn. This ability triggers only once each turn.";

const BATS: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "modify-pt-all", filter: { subtype: "Bat", controlledBy: "you" }, power: 1, toughness: 0, duration: "end-of-turn" },
    { kind: "grant-keyword-all", filter: { subtype: "Bat", controlledBy: "you" }, keyword: "deathtouch", duration: "end-of-turn" },
  ],
};

export default defineCard({
  name: "Moonstone Harbinger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat", "Warrior"],
  power: 1,
  toughness: 3,
  keywords: ["flying", "deathtouch"],
  text: `Flying, deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      whileCondition: { kind: "your-turn" },
      oncePerTurn: true,
      targets: [],
      effect: BATS,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "loses-life", who: "you" },
      whileCondition: { kind: "your-turn" },
      oncePerTurn: true,
      sameAbilityAs: 0,
      targets: [],
      effect: BATS,
      resolve: null,
      text: TEXT,
    },
  ],
});
