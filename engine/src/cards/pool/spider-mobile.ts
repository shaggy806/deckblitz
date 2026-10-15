import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 15931.
//
// The Spiders are counted as the trigger resolves.

const TRIGGER_TEXT =
  "Whenever this Vehicle attacks or blocks, it gets +1/+1 until end of turn for each Spider you control.";

const SPIDERS = { countOf: { subtype: "Spider", controlledBy: "you" } } as const;
const pump: EffectSpec = {
  kind: "modify-pt",
  target: "source",
  power: SPIDERS,
  toughness: SPIDERS,
  duration: "end-of-turn",
};

export default defineCard({
  name: "Spider-Mobile",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER_TEXT}\nCrew 2`,
  activated: [crew(2)],
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: pump, resolve: null, text: TRIGGER_TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: pump, resolve: null, text: TRIGGER_TEXT },
  ],
});
