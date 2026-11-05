import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

const TEXT =
  "Whenever this creature blocks or becomes blocked, you may pay {1}{G}. If you do, this creature gains first strike until end of turn. Otherwise, each creature blocking or blocked by this creature gains first strike until end of turn.";

const PAY_OR_NOT: EffectSpec = {
  kind: "may",
  prompt: "Pay {1}{G} to give Spitting Slug first strike? (Otherwise each creature blocking or blocked by it gains first strike.)",
  cost: "{1}{G}",
  effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
  else: {
    kind: "grant-keyword-all",
    filter: { type: "creature", blockingRelation: { relation: "either" } },
    keyword: "first-strike",
    duration: "end-of-turn",
  },
};

export default defineCard({
  name: "Spitting Slug",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Slug"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PAY_OR_NOT, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PAY_OR_NOT, resolve: null, text: TEXT },
  ],
});
