import { defineCard } from "../define.js";

const RETURN =
  "{W}, {T}: Return this creature to its owner's hand and return target Griffin card from your graveyard to your hand. Activate only during your upkeep.";

export default defineCard({
  name: "Mtenda Griffin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${RETURN}`,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Griffin" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: "source" },
          { kind: "return-to-hand", target: 0, from: "graveyard" },
        ],
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
