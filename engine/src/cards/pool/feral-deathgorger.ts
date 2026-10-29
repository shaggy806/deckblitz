import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, exile up to two target cards from a single graveyard.";

export default defineCard({
  name: "Feral Deathgorger",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 5,
  keywords: ["flying", "deathtouch"],
  text: `Flying, deathtouch\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "any" },
          max: 2,
          sameController: true,
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "exile", target: 0 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Feral Deathgorger", "Dusk Sight"],
  omen: true,
});
