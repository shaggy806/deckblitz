import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 30543.

const TEXT =
  "Kal-if-fee — When T'Pring enters, choose another target creature you control and target creature an opponent controls. You may have the chosen creatures fight each other. Whenever a creature that fought this way dies this turn, you draw a card.";

// They fight only if both are still creatures on the battlefield as it
// resolves (rule 701.14b): then each one that fought is watched for dying
// this turn (rule 603.7c, one delayed ability each).
const DIES_DRAW = (slot: number): EffectSpec => ({
  kind: "delayed-trigger",
  at: { leaves: slot, to: ["graveyard"], thisTurn: true },
  effect: { kind: "draw", amount: 1 },
  text: "When that creature dies this turn, you draw a card.",
});

export default defineCard({
  name: "T'Pring, Never Parted",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vulcan", "Citizen"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }, "creature-an-opponent-controls"],
      effect: {
        kind: "may",
        prompt: "Have the chosen creatures fight?",
        effect: {
          kind: "conditional",
          condition: {
            kind: "all",
            of: [
              { kind: "target", index: 0, filter: { type: "creature" } },
              { kind: "target", index: 1, filter: { type: "creature" } },
            ],
          },
          then: { kind: "sequence", effects: [{ kind: "fight", a: 0, b: 1 }, DIES_DRAW(0), DIES_DRAW(1)] },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
