import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. The end-step "if you descended this turn" is an
// intervening if, read off the turn's record; the three-counter check is the
// trigger's own as it resolves, and "those counters" are all the bore counters
// (Edgar Markov's Coffin's shape). The back face is Tecutlan, the Searing Rift.

const ENTER_TEXT = "When Brass's Tunnel-Grinder enters, discard any number of cards, then draw that many cards plus one.";
const END_TEXT =
  "At the beginning of your end step, if you descended this turn, put a bore counter on Brass's Tunnel-Grinder. Then if there are three or more bore counters on it, remove those counters and transform it.";

export default defineCard({
  name: "Brass's Tunnel-Grinder",
  art: "https://cards.scryfall.io/art_crop/front/d/6/d61d8895-7f2e-4c77-951f-4f1a49e96f57.jpg",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${END_TEXT} (You descended if a permanent card was put into your graveyard from anywhere.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true },
          { kind: "draw", amount: { sum: [{ thisWay: "discarded" }, 1] } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "descended" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "bore", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "bore", compare: { op: "gte", n: 3 } },
            then: {
              kind: "sequence",
              effects: [
                {
                  kind: "remove-counter",
                  target: "source",
                  counter: "bore",
                  amount: { countersOn: "source", counter: "bore" },
                },
                { kind: "transform", target: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Brass's Tunnel-Grinder", "Tecutlan, the Searing Rift"],
  transform: true,
});
