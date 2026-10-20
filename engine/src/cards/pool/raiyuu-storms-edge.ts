import { defineCard } from "../define.js";

// EDHREC rank 7078.

export default defineCard({
  name: "Raiyuu, Storm's Edge",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: "First strike\nWhenever a Samurai or Warrior you control attacks alone, untap it. If it's the first combat phase of the turn, there is an additional combat phase after this phase.",
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { subtypes: ["Samurai", "Warrior"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "trigger-object" },
          {
            kind: "conditional",
            condition: { kind: "turn-structure", combatPhase: 1 },
            then: { kind: "additional-combat", afterThisPhase: true },
          },
        ],
      },
      resolve: null,
      text: "Whenever a Samurai or Warrior you control attacks alone, untap it. If it's the first combat phase of the turn, there is an additional combat phase after this phase.",
    },
  ],
});
