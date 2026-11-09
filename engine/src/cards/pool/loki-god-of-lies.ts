import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast a spell that targets only a single creature, gain control of that creature until end of turn. If it's your turn, untap that creature and it gains haste until end of turn.";

const THAT_CREATURE = { inSet: { targetsOf: "trigger-object" } } as const;

// EDHREC rank 19610.
export default defineCard({
  name: "Loki, God of Lies",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Sorcerer", "Villain"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { only: true, single: true, permanent: { type: "creature" } } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control-all", filter: THAT_CREATURE, untilEndOfTurn: true },
          {
            kind: "conditional",
            condition: { kind: "your-turn" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "untap-all", filter: THAT_CREATURE },
                { kind: "grant-keyword-all", filter: THAT_CREATURE, keyword: "haste", duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
