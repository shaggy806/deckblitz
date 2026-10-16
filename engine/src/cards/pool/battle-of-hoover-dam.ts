import { defineCard } from "../define.js";

// EDHREC rank 8682. Fallout.
//
// A Siege's shape (Outpost Siege): each ability is gated on the word named as
// it entered, and with no word named it has neither (the ruling). NCR's
// target isn't "up to one": with no creature card to return it does nothing.
const NCR_TEXT =
  "NCR — At the beginning of your end step, return target creature card with mana value 3 or less from your graveyard to the battlefield with a finality counter on it.";
const LEGION_TEXT = "Legion — Whenever a creature you control dies, put two +1/+1 counters on target creature you control.";

export default defineCard({
  name: "Battle of Hoover Dam",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose NCR or Legion.\n• ${NCR_TEXT}\n• ${LEGION_TEXT}`,
  chooseOnEnter: ["NCR", "Legion"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "chosen-on-enter", value: "NCR" },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "finality", amount: 1 } },
      resolve: null,
      text: NCR_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      condition: { kind: "chosen-on-enter", value: "Legion" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: LEGION_TEXT,
    },
  ],
});
