import { defineCard } from "../define.js";

// EDHREC rank 18570. The mode is announced as the trigger goes on the stack
// (rule 700.2b). Each opponent chooses in turn order, seeing the earlier
// choices, and the enchantments are sacrificed at once (the ruling; rule
// 101.4) — the `sacrifice` edict's own way. The mode names are flavor.
//
// Rulings:
//   [2021-07-23] In a multiplayer game, each opponent in turn order will choose which enchantment
//     to sacrifice, and they get to know the choices made before them by other players. Once
//     those decisions are made, the chosen enchantments are all sacrificed at the same time.

const CONE_TEXT = "Antimagic Cone — Each opponent sacrifices an enchantment of their choice.";
const FEAR_TEXT = "Fear Ray — Creatures you control gain menace until end of turn.";
const TRIGGER_TEXT = "When this creature enters, choose one —";

export default defineCard({
  name: "Baleful Beholder",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beholder"],
  power: 6,
  toughness: 5,
  text: `${TRIGGER_TEXT}\n• ${CONE_TEXT}\n• ${FEAR_TEXT} (A creature with menace can't be blocked except by two or more creatures.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: CONE_TEXT,
            effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "enchantment" }, count: 1 },
          },
          {
            text: FEAR_TEXT,
            effect: {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "menace",
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
