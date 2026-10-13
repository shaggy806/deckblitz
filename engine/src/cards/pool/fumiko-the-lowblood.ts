import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 7143.
//
// Bushido X (rule 702.45a) is "whenever this creature blocks or becomes
// blocked, it gets +X/+X until end of turn": one trigger per half here, as
// a creature can't both block and become blocked in one combat. X is the
// number of attacking creatures — every player's — counted as the trigger
// resolves (the ruling).

const BUSHIDO_TEXT =
  "Fumiko has bushido X, where X is the number of attacking creatures. (Whenever this creature blocks or becomes blocked, it gets +X/+X until end of turn.)";
const ATTACK_TEXT = "Creatures your opponents control attack each combat if able.";

const ATTACKERS = { countOf: { type: "creature", attacking: true } } as const;
const BUSHIDO: EffectSpec = {
  kind: "modify-pt",
  target: "source",
  power: ATTACKERS,
  toughness: ATTACKERS,
  duration: "end-of-turn",
};

export default defineCard({
  name: "Fumiko the Lowblood",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 2,
  text: `${BUSHIDO_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: BUSHIDO,
      resolve: null,
      text: BUSHIDO_TEXT,
    },
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: BUSHIDO,
      resolve: null,
      text: BUSHIDO_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      restrictions: ["must-attack"],
      text: ATTACK_TEXT,
    },
  ],
});
