import { defineCard } from "../define.js";

// EDHREC rank 14478.
//
// "Copy … twice" is two copies of the one target (Strionic Resonator's
// effect, made twice): each its own instance on the stack, its controller
// asked about new targets for each in turn.

const COMBAT_TEXT = "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, draw a card.";
const COPY_TEXT =
  "{R}{G}{W}{U}, {T}: Copy target triggered ability you control twice. You may choose new targets for the copies.";

export default defineCard({
  name: "Mister Fantastic",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Hero"],
  power: 2,
  toughness: 4,
  keywords: ["reach", "vigilance"],
  text: `Reach, vigilance\n${COMBAT_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}{G}{W}{U}", tap: true },
      targets: [{ kind: "ability", whose: "you", abilityKind: "triggered" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "copy-ability", target: 0, newTargets: true },
          { kind: "copy-ability", target: 0, newTargets: true },
        ],
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
