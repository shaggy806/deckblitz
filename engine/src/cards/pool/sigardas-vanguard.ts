import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

const TEXT =
  "Whenever this creature enters or attacks, choose any number of creatures with different powers. Those creatures gain double strike until end of turn.";

// Chosen as the ability resolves, not targeted, from every creature in play:
// powers are read then, and hexproof doesn't stop one being chosen.
const CHOOSE: EffectSpec = {
  kind: "choose-permanents",
  filter: { type: "creature" },
  upTo: 99,
  together: { distinctPowers: true },
  then: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
  prompt: "Choose any number of creatures with different powers to gain double strike",
};

export default defineCard({
  name: "Sigarda's Vanguard",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: CHOOSE, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: CHOOSE, resolve: null, text: TEXT },
  ],
});
