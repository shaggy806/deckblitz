import { defineCard } from "../define.js";

// Activated from the graveyard. The returned permanent *gains* "if this
// permanent would leave the battlefield, exile it" — an ability
// (`exileIfItWouldLeave: "ability"`), so losing all abilities later strips it
// (rule 613.1f). Domain reduces only the generic part.
const RETURN_TEXT =
  'Domain — {7}{G}: Return this card from your graveyard to the battlefield tapped. It gains "If this permanent would leave the battlefield, exile it instead of putting it anywhere else." This ability costs {1} less to activate for each basic land type among lands you control.';

export default defineCard({
  name: "Llanowar Greenwidow",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 4,
  toughness: 3,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{7}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true, exileIfItWouldLeave: "ability" },
      costReduction: { reduceGeneric: { basicLandTypes: "you" } },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
