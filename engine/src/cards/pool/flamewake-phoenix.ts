import { defineCard } from "../define.js";

const FEROCIOUS_TEXT =
  "Ferocious — At the beginning of combat on your turn, if you control a creature with power 4 or greater, you may pay {R}. If you do, return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Flamewake Phoenix",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\nThis creature attacks each combat if able.\n${FEROCIOUS_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R} to return Flamewake Phoenix to the battlefield?",
        cost: "{R}",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: FEROCIOUS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
