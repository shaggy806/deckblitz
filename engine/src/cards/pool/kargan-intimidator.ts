import { defineCard } from "../define.js";

// EDHREC rank 11389.
//
// "Becomes a Coward" (no "in addition to its other types") replaces its
// creature types (rule 205.1b).
//
// Rulings:
//   [2020-09-25] If you control two or more Kargan Intimidators, track which modes have been
//     chosen each turn for each one's ability separately.
//   [2020-09-25] Once a creature has blocked a Warrior, turning that creature into a Coward won't
//     remove it from combat or cause the Warrior to become unblocked.

export default defineCard({
  name: "Kargan Intimidator",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: "Cowards can't block Warriors.\n{1}: Choose one that hasn't been chosen this turn —\n• This creature gets +1/+1 until end of turn.\n• Target creature becomes a Coward until end of turn.\n• Target Warrior gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenThisTurn: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "This creature gets +1/+1 until end of turn.",
            effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          },
          {
            text: "Target creature becomes a Coward until end of turn.",
            targets: ["creature"],
            effect: { kind: "add-types", target: 0, setSubtypes: ["Coward"], duration: "end-of-turn" },
          },
          {
            text: "Target Warrior gains trample until end of turn.",
            targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Warrior" } }],
            effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: "{1}: Choose one that hasn't been chosen this turn —",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Warrior" } },
      cantBeBlockedBy: { subtype: "Coward" },
      text: "Cowards can't block Warriors.",
    },
  ],
});
