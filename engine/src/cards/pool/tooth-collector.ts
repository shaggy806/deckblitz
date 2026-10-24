import { defineCard } from "../define.js";

// "Target creature that player controls": the upkeep is that opponent's own,
// so "that player" is the active player (`controlledBy: "active-player"`).

export default defineCard({
  name: "Tooth Collector",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, target creature an opponent controls gets -1/-1 until end of turn.\nDelirium — At the beginning of each opponent's upkeep, if there are four or more card types among cards in your graveyard, target creature that player controls gets -1/-1 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, target creature an opponent controls gets -1/-1 until end of turn.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "delirium" },
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "active-player" } }],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "Delirium — At the beginning of each opponent's upkeep, if there are four or more card types among cards in your graveyard, target creature that player controls gets -1/-1 until end of turn.",
    },
  ],
});
