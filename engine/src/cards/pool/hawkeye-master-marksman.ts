import { defineCard } from "../define.js";

// EDHREC rank 15229. The modes are the reflexive ability's, chosen as it goes
// on the stack with their targets, up to the number of times paid (rules
// 603.12, 700.2) — Tranquil Frillback's shape.
const WHEN_PAID = "When you do, choose up to that many —";
const TAPPED_TEXT = `Trick Arrows — Whenever Hawkeye becomes tapped, you may pay {1} up to three times. ${WHEN_PAID}`;
const NET = "Net — Target creature can't block this turn.";
const EXPLOSIVE = "Explosive — Hawkeye deals 2 damage to target player.";
const BOOMERANG = "Boomerang — Discard a card, then draw a card.";

export default defineCard({
  name: "Hawkeye, Master Marksman",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["reach", "first-strike"],
  text: `Reach, first strike\n${TAPPED_TEXT}\n• ${NET}\n• ${EXPLOSIVE}\n• ${BOOMERANG}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} up to three times?",
        cost: "{1}",
        costTimes: true,
        maxX: 3,
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          effect: {
            kind: "modal",
            announced: true,
            minModes: 0,
            maxModes: "x",
            modes: [
              { text: NET, targets: ["creature"], effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] } },
              { text: EXPLOSIVE, targets: ["player"], effect: { kind: "damage", amount: 2, target: 0 } },
              {
                text: BOOMERANG,
                effect: {
                  kind: "sequence",
                  effects: [
                    { kind: "discard", target: "you", amount: 1 },
                    { kind: "draw", amount: 1 },
                  ],
                },
              },
            ],
          },
          text: `${WHEN_PAID} ${NET} ${EXPLOSIVE} ${BOOMERANG}`,
        },
      },
      resolve: null,
      text: `${TAPPED_TEXT} ${NET} ${EXPLOSIVE} ${BOOMERANG}`,
    },
  ],
});
