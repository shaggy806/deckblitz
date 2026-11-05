import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const EXILE_TEXT =
  "Whenever this creature enters or deals combat damage to a player, exile up to one target nonland permanent. For as long as that card remains exiled, its owner may cast it.";
const DRAW_TEXT = "Whenever another player casts a spell from anywhere other than their hand, draw a card.";

const TARGET: TargetSpec = { kind: "optional", of: "nonland-permanent" };
const EXILE: EffectSpec = { kind: "exile", target: 0, mayCast: { duration: "while-exiled", byOwner: true } };

export default defineCard({
  name: "Aerial Extortionist",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${EXILE_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [TARGET], effect: EXILE, resolve: null, text: EXILE_TEXT },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [TARGET],
      effect: EXILE,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "opponent", notFrom: "hand" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
