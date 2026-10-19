import { defineCard } from "../define.js";

// EDHREC rank 14042. Streets of New Capenna. Rumor Gatherer's "second time
// this ability has resolved this turn" — on top of, not instead of, its own
// deathtouch.
const TEXT =
  "Alliance — Whenever another creature you control enters, this creature gains deathtouch until end of turn. If this is the second time this ability has resolved this turn, all creatures you control gain deathtouch until end of turn.";

export default defineCard({
  name: "Venom Connoisseur",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 2 },
            then: {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "deathtouch",
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
