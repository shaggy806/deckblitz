import { defineCard } from "../define.js";

// EDHREC rank 23913.

export default defineCard({
  name: "Foul-Tongue Invocation",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  kicker: {
    cost: "",
    keyword: "reveal",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon card", fromHand: true },
    orControls: { subtype: "Dragon" },
    effect: {
      kind: "sequence",
      effects: [
        { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
        { kind: "gain-life", amount: 4 },
      ],
    },
  },
  text: "As an additional cost to cast this spell, you may reveal a Dragon card from your hand.\nTarget player sacrifices a creature of their choice. If you revealed a Dragon card or controlled a Dragon as you cast this spell, you gain 4 life.",
  targets: ["player"],
  effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
});
