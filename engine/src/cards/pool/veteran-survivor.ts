import { defineCard } from "../define.js";

const SURVIVAL_TEXT = "Survival — At the beginning of your second main phase, if this creature is tapped, exile up to one target card from a graveyard.";
const STATIC_TEXT = "As long as there are three or more cards exiled with this creature, it gets +3/+3 and has hexproof. (It can't be the target of spells or abilities your opponents control.)";

export default defineCard({
  name: "Veteran Survivor",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 2,
  toughness: 1,
  text: `${SURVIVAL_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "source", filter: { tapped: true } },
        ],
      },
      resolve: null,
      text: SURVIVAL_TEXT,
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: { kind: "exile", target: 0, linked: true },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "exiled-with-source", atLeast: 3, now: true },
      grantPt: [3, 3],
      grantKeywords: ["hexproof"],
      text: STATIC_TEXT,
    },
  ],
});
