import { defineCard } from "../define.js";

// EDHREC rank 28889.

export default defineCard({
  name: "Excavation Elephant",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 3,
  toughness: 5,
  kicker: { cost: "{1}{W}" },
  text: "Kicker {1}{W} (You may pay an additional {1}{W} as you cast this spell.)\nWhen this creature enters, if it was kicked, return target artifact card from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "When this creature enters, if it was kicked, return target artifact card from your graveyard to your hand.",
      condition: { kind: "self-kicked" },
    },
  ],
});
