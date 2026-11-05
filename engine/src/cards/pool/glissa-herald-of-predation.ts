import { defineCard } from "../define.js";

const COMBAT = "At the beginning of combat on your turn, choose one —";

export default defineCard({
  name: "Glissa, Herald of Predation",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Elf"],
  power: 3,
  toughness: 5,
  text: `${COMBAT}\n• Incubate 2 twice. (To incubate 2, create an Incubator token with two +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)\n• Transform all Incubator tokens you control.\n• Phyrexians you control gain first strike and deathtouch until end of turn.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Incubate 2 twice.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "incubate", amount: 2 },
                { kind: "incubate", amount: 2 },
              ],
            },
          },
          {
            text: "Transform all Incubator tokens you control.",
            effect: {
              kind: "for-each-permanent",
              filter: { subtype: "Incubator", token: true, controlledBy: "you" },
              simultaneous: true,
              effect: { kind: "transform", target: 0 },
            },
          },
          {
            text: "Phyrexians you control gain first strike and deathtouch until end of turn.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "grant-keyword-all", filter: { subtype: "Phyrexian", controlledBy: "you" }, keyword: "first-strike", duration: "end-of-turn" },
                { kind: "grant-keyword-all", filter: { subtype: "Phyrexian", controlledBy: "you" }, keyword: "deathtouch", duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: COMBAT,
    },
  ],
});
