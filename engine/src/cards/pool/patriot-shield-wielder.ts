import { defineCard } from "../define.js";

// EDHREC rank 17888.

const PUMP_TEXT = "{2}, {T}: Another target creature you control gets +2/+0 and gains hexproof until end of turn.";

export default defineCard({
  name: "Patriot, Shield Wielder",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  text: `${PUMP_TEXT} (It can't be the target of spells or abilities your opponents control.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
