import { defineCard } from "../define.js";

// EDHREC rank 11771.
//
// Outlaws are the five creature types the reminder text lists (as Vihaan,
// Goldwaker). "Dies" is a leaves-the-battlefield trigger, so it looks back:
// outlaws dying at the same time as this enchantment leaves each trigger it
// (the ruling, rule 603.10a).
const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];
const ENTER =
  'When this enchantment enters, create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."';
const DIES =
  "Whenever an outlaw you control dies, each opponent loses 1 life and you gain 1 life. (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.)";

export default defineCard({
  name: "Rakish Crew",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTER}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtypes: OUTLAWS } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
