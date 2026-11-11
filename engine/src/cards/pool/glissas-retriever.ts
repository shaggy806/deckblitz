import { defineCard } from "../define.js";

const EVASION_TEXT = "This creature can't be blocked by creatures with power 2 or less.";
const RETURN_TEXT =
  "When you do, return up to X target cards from your graveyard to your hand, where X is the number of opponents who have three or more poison counters.";
const DIES_TEXT = `Corrupted — When this creature dies, exile it. ${RETURN_TEXT}`;

export default defineCard({
  name: "Glissa's Retriever",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 6,
  toughness: 6,
  keywords: ["haste"],
  toxic: 3,
  text: `Haste, toxic 3 (Players dealt combat damage by this creature also get three poison counters.)\n${EVASION_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "lte", n: 2 } } }],
      text: EVASION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "reflexive-trigger",
              targets: [
                {
                  kind: "any-number",
                  of: { kind: "card-in-graveyard", whose: "you" },
                  max: {
                    countPlayers: "each-opponent",
                    where: {
                      kind: "of-player",
                      player: "that-player",
                      condition: { kind: "player-counters", counter: "poison", who: "you", atLeast: 3 },
                    },
                  },
                },
              ],
              effect: {
                kind: "for-each-target",
                from: 0,
                simultaneous: true,
                effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
              },
              text: RETURN_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
