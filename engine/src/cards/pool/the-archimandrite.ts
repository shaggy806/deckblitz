import { defineCard } from "../define.js";

// EDHREC rank 17735.
//
// Rulings:
//   [2022-10-14] You can’t gain negative amounts of life. If you have fewer than four cards in
//     hand as the first ability resolves, you won’t gain any life, but you won’t lose any life
//     either.
//   [2022-10-14] Since The Archimandrite’s activated ability doesn’t have a tap symbol in its
//     cost, you can tap creatures that haven’t been under your control since your most recent turn
//     began (including The Archimandrite itself) to pay the cost.
//
// The upkeep gain is Ivory Tower's (`difference` never goes below 0). The
// pump reads the life gained off the trigger, and reaches the Advisors,
// Artificers and Monks you control as it resolves. The tap cost may tap the
// Archimandrite itself (an Advisor) and summoning-sick creatures.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, you gain X life, where X is the number of cards in your hand minus 4.";
const GAIN_TEXT =
  "Whenever you gain life, each Advisor, Artificer, and Monk you control gains vigilance and gets +X/+0 until end of turn, where X is the amount of life you gained.";
const DRAW_TEXT = "Tap three untapped Advisors, Artificers, and/or Monks you control: Draw a card.";

const TRIBES = { subtypes: ["Advisor", "Artificer", "Monk"], controlledBy: "you" } as const;

export default defineCard({
  name: "The Archimandrite",
  manaCost: "{2}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 0,
  toughness: 5,
  text: `${UPKEEP_TEXT}\n${GAIN_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 3, filter: TRIBES, includeSelf: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "gain-life", amount: { difference: [{ cardsInHand: "you" }, 4] } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: TRIBES, keyword: "vigilance", duration: "end-of-turn" },
          {
            kind: "modify-pt-all",
            filter: TRIBES,
            power: { triggerValue: true },
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
