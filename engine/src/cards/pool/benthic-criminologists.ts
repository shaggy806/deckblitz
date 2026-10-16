import { defineCard } from "../define.js";

// One ability with two trigger events (Yuma, Proud Protector's shape),
// counted as one (`sameAbilityAs`).

const TEXT = "Whenever this creature enters or attacks, you may sacrifice an artifact. If you do, draw a card.";

const sacrificeAnArtifact = {
  kind: "each-player-may",
  who: "you",
  options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
  ifDid: { kind: "draw", amount: 1 },
} as const;

export default defineCard({
  name: "Benthic Criminologists",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: sacrificeAnArtifact, resolve: null, text: TEXT },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: sacrificeAnArtifact,
      resolve: null,
      text: TEXT,
    },
  ],
});
