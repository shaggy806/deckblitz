import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import type { Keyword } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, it gains flying until end of turn if you control a creature with flying. The same is true for first strike, double strike, deathtouch, indestructible, lifelink, menace, and trample.";

const SHARED: readonly Keyword[] = [
  "flying",
  "first-strike",
  "double-strike",
  "deathtouch",
  "indestructible",
  "lifelink",
  "menace",
  "trample",
];

// Each keyword is checked as the ability resolves (the ruling).
const share = (keyword: Keyword): EffectSpec => ({
  kind: "conditional",
  condition: { kind: "controls", filter: { type: "creature", keyword }, atLeast: 1 },
  then: { kind: "grant-keyword", target: "source", keyword, duration: "end-of-turn" },
});

export default defineCard({
  name: "Thunderous Orator",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "sequence", effects: SHARED.map(share) },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
