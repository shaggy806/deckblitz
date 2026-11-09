import { defineCard } from "../define.js";

export default defineCard({
  name: "Nameless Inversion",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["kindred", "instant"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\nTarget creature gets +3/-3 and loses all creature types until end of turn.",
  targets: [{ kind: "permanent", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: -3, duration: "end-of-turn" },
      { kind: "become", target: 0, loseCreatureTypes: true, duration: "end-of-turn" },
    ],
  },
});
