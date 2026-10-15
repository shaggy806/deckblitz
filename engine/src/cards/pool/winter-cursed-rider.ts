import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const GRANT_TEXT = "Artifacts you control have \"Ward—Pay 2 life.\"";
const EXHAUST_TEXT =
  "Exhaust — {2}{U}{B}, {T}, Exile X artifact cards from your graveyard: Each other nonartifact creature gets -X/-X until end of turn.";

export default defineCard({
  name: "Winter, Cursed Rider",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 2,
  text: `Ward—Pay 2 life.\n${GRANT_TEXT}\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)`,
  activated: [
    {
      // X is announced for the exile alone (the mana cost has no {X}).
      cost: { mana: "{2}{U}{B}", tap: true, exileFromGraveyard: { count: "x", filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", notTypes: ["artifact"] },
        exceptSource: true,
        power: { product: ["x", -1] },
        toughness: { product: ["x", -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
  ],
  triggered: [ward({ payLife: 2 })],
  static: [
    {
      // Winter too, should it become an artifact — a second ward (the ruling).
      affects: { scope: "filter", filter: { type: "artifact", controlledBy: "you" } },
      grantsTriggered: [ward({ payLife: 2 })],
      text: GRANT_TEXT,
    },
  ],
});
