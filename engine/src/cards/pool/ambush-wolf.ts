import { defineCard } from "../define.js";

const TEXT = "When this creature enters, exile up to one target card from a graveyard.";

export default defineCard({
  name: "Ambush Wolf",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 4,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
