import { defineCard } from "../define.js";

// EDHREC rank 12997. The omen counter is part of the mana ability (`also`),
// so it doesn't use the stack. The end-step trigger is an intervening if
// (rule 603.4), checked as it triggers and again as it resolves; it can't be
// tapped for mana in between, being untapped only as the ability resolves
// (the ruling). The back face is Forsaken Thresher.
const MANA_TEXT = "{T}: Add one mana of any color. Put an omen counter on this creature.";
const END_TEXT =
  "At the beginning of your end step, if there are three or more omen counters on this creature, untap it, then transform it.";

export default defineCard({
  name: "Foreboding Statue",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 2,
  text: `${MANA_TEXT}\n${END_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: { kind: "add-counter", target: "source", counter: "omen", amount: 1 },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "self-counters", counter: "omen", compare: { op: "gte", n: 3 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "source" },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Foreboding Statue", "Forsaken Thresher"],
  transform: true,
});
