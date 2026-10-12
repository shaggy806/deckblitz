import { defineCard } from "../define.js";

export default defineCard({
  name: "Knight of Old Benalia",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  suspend: { n: 5, cost: "{W}" },
  text: "Suspend 5—{W} (Rather than cast this card from your hand, you may pay {W} and exile it with five time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)\nWhen this creature enters, other creatures you control get +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "When this creature enters, other creatures you control get +1/+1 until end of turn.",
    },
  ],
});
