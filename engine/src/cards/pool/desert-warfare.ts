import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 5747. Modern Horizons 3.
//
// One ability with three trigger events — sacrificing a Desert, and a Desert
// card put into your graveyard from your hand or from your library —
// written as three triggers with the same effect (Astrologian's
// Planisphere's shape); no one event is two of them. "That card" is the one
// the event put there: if it leaves the graveyard before the delayed
// trigger resolves, it's a new object that isn't put onto the battlefield
// from its new zone (the first ruling, rule 400.7). A sacrificed Desert
// someone else owns goes to their graveyard and comes back under your
// control. "Create that many" is the Deserts you control as it resolves;
// "they gain haste" is gained, not printed (`gainKeywords`).
//
// Rulings:
//   [2024-06-07] If the Desert leaves your graveyard before the delayed triggered ability created by
//     Desert Warfare's first ability resolves, that Desert won't be put onto the battlefield from its
//     new zone when that ability resolves.
//   [2024-06-07] Desert Warfare's first ability won't return any Deserts that you sacrificed or that
//     were put into your graveyard from your hand or library before Desert Warfare entered the
//     battlefield.

const RETURN_TEXT =
  "Whenever you sacrifice a Desert and whenever a Desert card is put into your graveyard from your hand or library, put that card onto the battlefield under your control at the beginning of your next end step.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, if you control five or more Deserts, create that many 1/1 red, green, and white Sand Warrior creature tokens. They gain haste.";

const RETURN: EffectSpec = {
  kind: "delayed-trigger",
  at: "your-next-end-step",
  effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
  text: "Put that card onto the battlefield under your control.",
};

export default defineCard({
  name: "Desert Warfare",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${RETURN_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Desert" } },
      targets: [],
      effect: RETURN,
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "put-into-graveyard", who: "you", from: "hand", filter: { subtype: "Desert" } },
      targets: [],
      effect: RETURN,
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "put-into-graveyard", who: "you", from: "library", filter: { subtype: "Desert" } },
      targets: [],
      effect: RETURN,
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "controls", filter: { subtype: "Desert" }, atLeast: 5 },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Sand Warrior Token",
        count: { countOf: { subtype: "Desert", controlledBy: "you" } },
        gainKeywords: ["haste"],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
