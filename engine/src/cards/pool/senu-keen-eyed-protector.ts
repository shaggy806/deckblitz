import { defineCard } from "../define.js";

// Exiling Senu is part of the cost (Campfire's `do`). The last ability works
// only while the card is in exile (`fromExile`, rule 113.6k) — "if this card
// is exiled" is that — and its owner chooses whom it attacks (rule 508.4).
const EXILE = "{T}, Exile Senu: You gain 2 life and scry 2.";
const RETURN =
  "When a legendary creature you control attacks and isn't blocked, if this card is exiled, put it onto the battlefield attacking.";

export default defineCard({
  name: "Senu, Keen-Eyed Protector",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${EXILE}\n${RETURN}`,
  activated: [
    {
      cost: { mana: null, tap: true, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: { kind: "sequence", effects: [{ kind: "gain-life", amount: 2 }, { kind: "scry", amount: 2 }] },
      resolve: null,
      text: EXILE,
    },
  ],
  triggered: [
    {
      fromExile: true,
      trigger: { on: "attacks-unblocked", who: "you-control", filter: { type: "creature", supertype: "legendary" } },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", attacking: "choose" },
      resolve: null,
      text: RETURN,
    },
  ],
});
