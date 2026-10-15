import { defineCard } from "../define.js";

// EDHREC rank 22650.
// A Plan (Claim the Kingdom's fourth-counter trigger and reflexive "when you
// do"). The tap cost is Adaptive Gemguard's `tapOthers`, over Villains.

const TAP_TEXT =
  "Tap an untapped Villain you control: Mill a card. Put a plan counter on this enchantment. Activate only as a sorcery.";
const PLAN_TEXT =
  "When the fourth plan counter is put on this enchantment, sacrifice it. When you do, return target creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Villainous Syndication",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Plan"],
  text: `${TAP_TEXT} (To mill a card, put the top card of your library into your graveyard.)\n${PLAN_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { subtype: "Villain", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          { kind: "add-counter", target: "source", counter: "plan", amount: 1 },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-put", who: "self", counter: "plan", nth: 4 },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: {
          kind: "reflexive-trigger",
          targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
          effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
          text: "Return target creature card from your graveyard to the battlefield.",
        },
      },
      resolve: null,
      text: PLAN_TEXT,
    },
  ],
});
