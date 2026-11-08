import { defineCard } from "../define.js";

// Exiling the Sylex pays the cost, so its exile trigger resolves first: the
// search happens before anyone chooses lands (the ruling).

const BLAST_TEXT =
  "{2}{W}{W}, {T}, Exile Urza's Sylex: Each player chooses six lands they control. Destroy all other permanents. Activate only as a sorcery.";
const EXILE_TEXT =
  "When Urza's Sylex is put into exile from the battlefield, you may pay {2}. If you do, search your library for a planeswalker card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Urza's Sylex",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${BLAST_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{W}{W}", tap: true, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            for: { permanent: { type: "land", controlledBy: "you" }, own: true, count: 6, keep: true },
          },
          { kind: "destroy-all", filter: { notThisWay: "chosen" } },
        ],
      },
      resolve: null,
      text: BLAST_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["exile"] },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to search your library for a planeswalker card?",
        cost: "{2}",
        effect: {
          kind: "search-library",
          filter: { type: "planeswalker" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
