import { defineCard } from "../define.js";

export default defineCard({
  name: "Aurelia, the Warleader",
  manaCost: "{2}{R}{R}{W}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "vigilance", "haste"],
  text: "Flying, vigilance, haste\nWhenever Aurelia attacks for the first time each turn, untap all creatures you control. After this phase, there is an additional combat phase.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self", firstTimeEachTurn: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
          { kind: "additional-combat", afterThisPhase: true },
        ],
      },
      resolve: null,
      text: "Whenever Aurelia attacks for the first time each turn, untap all creatures you control. After this phase, there is an additional combat phase.",
    },
  ],
});
