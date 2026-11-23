import { defineCard } from "../define.js";

// Playtest card (Mystery Booster). Megasunburst: two +1/+1 counters for each
// color of mana spent to cast it (sunburst doubled, rule 702.44) — none when
// it isn't cast. The keyword is chosen as the ability resolves.

const MEGASUNBURST =
  "Megasunburst (This enters the battlefield with two +1/+1 counters on it for each color of mana spent to cast it)";
const REMOVE_TEXT =
  "Remove three +1/+1 counters from Sawtooth Avenger: Sawtooth Avenger gains your choice of deathtouch, lifelink, or menace until end of turn.";

export default defineCard({
  name: "Sawtooth Avenger",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem", "Construct"],
  power: 0,
  toughness: 0,
  text: `${MEGASUNBURST}\n${REMOVE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { product: [2, { manaSpentOf: "source", count: "colors" }] } },
      },
      text: MEGASUNBURST,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 3 } },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Deathtouch", effect: { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" } },
          { text: "Lifelink", effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" } },
          { text: "Menace", effect: { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" } },
        ],
      },
      resolve: null,
      text: REMOVE_TEXT,
    },
  ],
});
