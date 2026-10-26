import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 21451.
//
// Bushido 1 (rule 702.45) as two triggers sharing one pump, the way Jukai Trainee and Fumiko
// the Lowblood write it: a creature never both blocks and becomes blocked in one combat.
const BUSHIDO_TEXT = "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)";
const REGEN_TEXT = "{1}{B}: Regenerate this creature.";
const PUMP = { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Kuro's Taken",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Samurai"],
  power: 1,
  toughness: 1,
  text: `${BUSHIDO_TEXT}\n${REGEN_TEXT}`,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO_TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO_TEXT },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
});
