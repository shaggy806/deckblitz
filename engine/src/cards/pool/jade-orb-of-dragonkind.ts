import { defineCard } from "../define.js";

// Commander Legends: Battle for Baldur's Gate. "When you spend this mana" is a
// triggered ability (the spell is its slot 0): it resolves over the spell, whose
// counter and hexproof then carry onto the Dragon it becomes.

const WHEN_SPENT =
  "When you spend this mana to cast a Dragon creature spell, it enters with an additional +1/+1 counter on it and gains hexproof until your next turn.";
const TEXT = `{T}: Add {G}. ${WHEN_SPENT}`;

export default defineCard({
  name: "Jade Orb of Dragonkind",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: `${TEXT} (It can't be the target of spells or abilities your opponents control.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: 1,
        whenSpent: {
          spell: { type: "creature", subtype: "Dragon" },
          effect: {
            kind: "sequence",
            effects: [
              { kind: "enters-with-counters", target: 0, counter: "+1/+1", amount: 1 },
              { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "until-your-next-turn" },
            ],
          },
          text: WHEN_SPENT,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
