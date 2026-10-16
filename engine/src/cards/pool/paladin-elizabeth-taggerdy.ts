import { defineCard } from "../define.js";

// EDHREC rank 7299. Fallout.
//
// Battalion is part of the trigger condition (General Thunderbolt Ross's
// `whileCondition`): her and at least two others declared together; once it
// has triggered, how many are still attacking doesn't matter (the ruling).
// X is her power as the ability resolves — as she last existed on the
// battlefield if she has left (the ruling) — read after the draw. The
// creature enters attacking whoever its controller chooses (the ruling), and
// was never declared an attacker, so it fires no attack triggers.
const BATTALION_TEXT =
  "Battalion — Whenever Paladin Elizabeth Taggerdy and at least two other creatures attack, draw a card, then you may put a creature card with mana value X or less from your hand onto the battlefield tapped and attacking, where X is Paladin Elizabeth Taggerdy's power.";

export default defineCard({
  name: "Paladin Elizabeth Taggerdy",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 2,
  text: BATTALION_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            enterTapped: true,
            attacking: "choose",
            leftover: "stay",
            filter: { type: "creature", manaValue: { op: "lte", n: { amount: { powerOf: "source" } } } },
          },
        ],
      },
      resolve: null,
      text: BATTALION_TEXT,
    },
  ],
});
