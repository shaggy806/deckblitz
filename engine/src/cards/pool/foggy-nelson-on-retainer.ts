import { defineCard } from "../define.js";

// EDHREC rank 23561.

const ETB_TEXT =
  "When Foggy Nelson enters, put a +1/+1 counter on another target creature you control. It gains hexproof until end of turn.";

export default defineCard({
  name: "Foggy Nelson, On Retainer",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT} (It can't be the target of spells or abilities your opponents control.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
