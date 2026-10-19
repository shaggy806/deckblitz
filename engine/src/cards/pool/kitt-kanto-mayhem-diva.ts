import { defineCard } from "../define.js";

// Streets of New Capenna. "That player" is the player whose turn it is: the
// trigger and its reflexive ability both happen during that turn's beginning
// of combat. Tapping the two creatures (Kitt Kanto may be one) is optional
// and only offered with two untapped creatures to tap.
const ENTER_TEXT = "When Kitt Kanto enters, create a 1/1 green and white Citizen creature token.";
const COMBAT_TEXT =
  "At the beginning of combat on each player's turn, you may tap two untapped creatures you control. When you do, target creature that player controls gets +2/+2 and gains trample until end of turn. Goad that creature.";
const UNTAPPED_CREATURE = { type: "creature", controlledBy: "you", tapped: false } as const;

export default defineCard({
  name: "Kitt Kanto, Mayhem Diva",
  manaCost: "{1}{R}{G}{W}",
  colors: ["R", "G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Bard", "Druid"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Citizen Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: UNTAPPED_CREATURE, atLeast: 2 },
        then: {
          kind: "may",
          prompt: "Tap two untapped creatures you control?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "choose-permanents",
                filter: UNTAPPED_CREATURE,
                min: 2,
                upTo: 2,
                then: { kind: "tap", target: 0 },
                prompt: "Tap two untapped creatures you control",
              },
              {
                kind: "reflexive-trigger",
                targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "active-player" } }],
                effect: {
                  kind: "sequence",
                  effects: [
                    { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
                    { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
                    { kind: "goad", target: 0 },
                  ],
                },
                text: "When you do, target creature that player controls gets +2/+2 and gains trample until end of turn. Goad that creature.",
              },
            ],
          },
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
