import { defineCard } from "../define.js";

export default defineCard({
  name: "Kirtar's Wrath",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all creatures. They can't be regenerated.\nThreshold — If there are seven or more cards in your graveyard, instead destroy all creatures, then create two 1/1 white Spirit creature tokens with flying. Creatures destroyed this way can't be regenerated.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: {
      kind: "sequence",
      effects: [
        { kind: "destroy-all", filter: { type: "creature" }, cantBeRegenerated: true },
        { kind: "create-token", token: "Spirit Token", count: 2 },
      ],
    },
    else: { kind: "destroy-all", filter: { type: "creature" }, cantBeRegenerated: true },
  },
});
