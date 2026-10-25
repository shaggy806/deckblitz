import { defineCard } from "../define.js";

// "Tap target creature that player controls": the upkeep is that opponent's
// own, so "that player" is the active player — a creature target filtered by
// `controlledBy: "active-player"`, read as it's chosen and again as it resolves.

export default defineCard({
  name: "Topplegeist",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, tap target creature an opponent controls.\nDelirium — At the beginning of each opponent's upkeep, if there are four or more card types among cards in your graveyard, tap target creature that player controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "When this creature enters, tap target creature an opponent controls.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "delirium" },
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "active-player" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Delirium — At the beginning of each opponent's upkeep, if there are four or more card types among cards in your graveyard, tap target creature that player controls.",
    },
  ],
});
