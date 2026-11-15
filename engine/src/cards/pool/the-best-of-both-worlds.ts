import { defineCard } from "../define.js";

// EDHREC rank 26496.

const I_TEXT =
  "I — Assimilate target nonartifact creature an opponent controls. (Gain control of it and put a +1/+1 counter on it. It's a Borg artifact creature and loses all other creature types.)";
const II_TEXT = "II — Artifact creatures you control get +2/+2 until end of turn.";
const III_TEXT = "III — Exile the Borg assimilated with this Saga, then return it to the battlefield under its owner's control.";

// Chapter I remembers the creature it assimilated on the Saga (rule 607.2d,
// in that creature's stint): chapter III's "the Borg assimilated with this
// Saga" is it while it stays on the battlefield and is still a Borg.
export default defineCard({
  name: "The Best of Both Worlds",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", notTypes: ["artifact"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          {
            kind: "become",
            target: 0,
            addTypes: ["artifact", "creature"],
            setSubtypes: ["Borg"],
            duration: "permanent",
          },
          { kind: "remember-chosen-permanent" },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { types: ["artifact", "creature"], controlledBy: "you" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "object-matches", object: "chosen", filter: { subtype: "Borg" } },
        then: { kind: "flicker", target: "chosen" },
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
