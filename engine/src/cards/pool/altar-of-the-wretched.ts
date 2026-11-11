import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

// EDHREC rank 7548.
//
// The sacrifice is chosen as the ability resolves; X is the sacrificed
// creature's power as it last was (rule 608.2h). Craft's materials are one or
// more creatures you control and/or creature cards in your graveyard (rule
// 702.167a), a token among them leaving nothing behind (its ruling). The last
// ability works only from the graveyard.
const X = { aggregate: "sum", of: "power", filter: {}, in: { thisWay: "sacrificed" } } as const;
const ENTER_TEXT =
  "When this artifact enters, you may sacrifice a nontoken creature. If you do, draw X cards, then mill X cards, where X is that creature's power.";
const CRAFT_TEXT =
  "Craft with one or more creatures {2}{B}{B} ({2}{B}{B}, Exile this artifact, Exile the one or more from among creatures you control and/or creature cards in your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";
const RETURN_TEXT = "{2}{B}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Altar of the Wretched",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${CRAFT_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice a nontoken creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice", who: "you", filter: { type: "creature", token: false }, count: 1 },
            { kind: "draw", amount: X },
            { kind: "mill", target: "you", amount: X },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    craft(
      "{2}{B}{B}",
      { count: 1, orMore: true, filter: { type: "creature" }, text: "one or more creatures" },
      "Craft with one or more creatures {2}{B}{B}",
    ),
    {
      cost: { mana: "{2}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  faces: ["Altar of the Wretched", "Wretched Bonemass"],
  transform: true,
});
