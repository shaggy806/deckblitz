import { defineCard } from "../define.js";

// EDHREC rank 5619.
//
// "One or more … die" with "triggers only once each turn": a dies trigger
// per creature, of which only the first each turn triggers (`oncePerTurn`),
// so several dying at once still trigger it once. "Attacking" is read as the
// creature last existed on the battlefield (rule 603.10a), and Éomer dying
// alongside them still sees them die (its ruling). Savage Beating's effect.

const TEXT =
  "Whenever one or more other attacking legendary creatures you control die, untap all creatures you control. After this phase, there is an additional combat phase. This ability triggers only once each turn.";

export default defineCard({
  name: "Éomer, Marshal of Rohan",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", supertype: "legendary", attacking: true },
        otherOnly: true,
      },
      oncePerTurn: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
          { kind: "additional-combat", afterThisPhase: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
