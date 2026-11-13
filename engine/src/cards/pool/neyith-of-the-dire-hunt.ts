import { defineCard } from "../define.js";

// EDHREC rank 4303. "Fight or become blocked" is two events that never happen
// together, so the one printed ability is two entries: a fight as one event
// (`creatures-fight`, batched — two of yours fighting each other draw one
// card) and the declaration's batch of your creatures that became blocked.
// The last sentence of the combat ability isn't under "if you do": the target
// creature must be blocked this combat if able whether or not you pay.
//
// Rulings:
//   - If each creature the defending player controls can't block for any reason (such as being
//     tapped), then the target creature isn't blocked. If there's a cost associated with blocking
//     the target creature, the defending player isn't forced to pay that cost, so it doesn't have
//     to be blocked in that case either.
//   - A creature "fights" when an effect instructs it to fight. Dealing combat damage isn't
//     fighting.
//   - The defending player, not you, chooses which creature blocks the target creature.
//   - You draw just one card as Neyith's first ability resolves, no matter how many creatures you
//     control fought or became blocked.
//   - If an effect instructs you to "double" a creature's power, that creature gets +X/+0, where X
//     is its power as that effect begins to apply.
//   - While resolving Neyith's last ability, you can't pay multiple times to double a creature's
//     power more than once or to double more than one creature's power.
//   - If the target creature has menace, two creatures must block it if able.
//   - Only one creature is required to block the target creature. Other creatures may also block
//     it and are free to block other creatures or not block at all.

const DRAW_TEXT = "Whenever one or more creatures you control fight or become blocked, draw a card.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may pay {2}{R/G}. If you do, double target creature's power until end of turn. That creature must be blocked this combat if able. ({R/G} can be paid with either {R} or {G}.)";

export default defineCard({
  name: "Neyith of the Dire Hunt",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${DRAW_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "creatures-fight", who: "you-control", batched: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "become-blocked-batch", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "may",
            prompt: "Pay {2}{R/G} to double the target creature's power until end of turn?",
            cost: "{2}{R/G}",
            effect: {
              kind: "modify-pt",
              target: 0,
              power: { powerOf: 0, doubling: true },
              toughness: 0,
              duration: "end-of-turn",
            },
          },
          { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"], duration: "until-end-of-combat" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
