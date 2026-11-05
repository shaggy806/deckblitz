import { defineCard } from "../define.js";

// EDHREC rank 12628.
const ENERGY_TEXT =
  "Whenever one or more artifact creatures you control deal combat damage to a player, you get {E}{E} (two energy counters).";
const JET_TEXT =
  "At the beginning of your end step, you may pay one or more {E}. If you do, create an X/X colorless Vehicle artifact token named Nalaar Aetherjet with flying and crew 2, where X is the amount of {E} paid this way.";

export default defineCard({
  name: "Pia Nalaar, Chief Mechanic",
  manaCost: "{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 4,
  text: `${ENERGY_TEXT}\n${JET_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { types: ["artifact", "creature"] },
        combat: true,
      },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENERGY_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay one or more {E} to create an X/X Nalaar Aetherjet, X the amount paid?",
        costEnergyX: "one-or-more",
        effect: {
          kind: "create-token",
          token: "Nalaar Aetherjet Token",
          count: 1,
          basePt: { power: "x", toughness: "x" },
        },
      },
      resolve: null,
      text: JET_TEXT,
    },
  ],
});
