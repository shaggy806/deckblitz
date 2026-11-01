import { defineCard } from "../define.js";

const VEHICLES_TEXT = "Vehicles you control get +1/+1 and have reach and vigilance.";
// "A Vehicle crewed by Balthier and Fran this turn" (rule 702.122c): one it
// was tapped to pay the crew cost of this turn, still the same object —
// `crewedBySource`, read against Balthier and Fran as the attack triggers.
const ATTACK_TEXT =
  "Whenever a Vehicle crewed by Balthier and Fran this turn attacks, if it's the first combat phase of the turn, you may pay {1}{R}{G}. If you do, after this phase, there is an additional combat phase.";

export default defineCard({
  name: "Balthier and Fran",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Rabbit"],
  power: 4,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${VEHICLES_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Vehicle", controlledBy: "you" } },
      grantPt: [1, 1],
      grantKeywords: ["reach", "vigilance"],
      text: VEHICLES_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "any", filter: { subtype: "Vehicle", crewedBySource: true } },
      condition: { kind: "turn-structure", combatPhase: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{R}{G} for an additional combat phase after this one?",
        cost: "{1}{R}{G}",
        effect: { kind: "additional-combat", afterThisPhase: true },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
