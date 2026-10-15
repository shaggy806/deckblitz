import { defineCard } from "../define.js";

// EDHREC rank 12261.

const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, put that many incubation counters on it.";
const DRAKE_TEXT = "Remove three incubation counters from this creature: Create a 2/2 blue Drake creature token with flying.";

export default defineCard({
  name: "Drake Hatcher",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance, prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\n${DAMAGE_TEXT}\n${DRAKE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "incubation", count: 3 } },
      targets: [],
      effect: { kind: "create-token", token: "Drake Token", count: 1 },
      resolve: null,
      text: DRAKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "incubation", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
