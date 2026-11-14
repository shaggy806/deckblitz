import { defineCard } from "../define.js";

// Star Trek (TRK). Each end step's ability is an intervening "if" (rule
// 603.4) on the journal's "put-into-hand": a permanent of yours put into your
// hand from the battlefield this turn, whoever controlled it and whatever
// returned it — Barrin, Tolarian Archmage's read.

const BOUNCE_TEXT =
  "When Miles O'Brien enters, return up to one other target creature or artifact you control to its owner's hand.";
const DRAW_TEXT =
  "At the beginning of each end step, if a permanent was returned to your hand from the battlefield this turn, draw a card.";

export default defineCard({
  name: "Miles O'Brien, Transporter Ops",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: `${BOUNCE_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "other",
            of: { kind: "permanent", whose: "you", filter: { typesAnyOf: ["creature", "artifact"] } },
          },
        },
      ],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "put-into-hand" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
