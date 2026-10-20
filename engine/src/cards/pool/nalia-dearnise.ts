import { defineCard } from "../define.js";

// Rulings: the full-party check is an intervening if, asked at the beginning
// of combat and again as the ability resolves; the creatures keep deathtouch
// for the turn once it has resolved.

const LOOK = "You may look at the top card of your library any time.";
const CAST = "You may cast Cleric, Rogue, Warrior, and Wizard spells from the top of your library.";
const COMBAT =
  "At the beginning of combat on your turn, if you have a full party, put a +1/+1 counter on each creature you control and those creatures gain deathtouch until end of turn.";

export default defineCard({
  name: "Nalia de'Arnise",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: `${LOOK}\n${CAST}\n${COMBAT}`,
  looksAtOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      castFromLibraryTop: { filter: { subtypes: ["Cleric", "Rogue", "Warrior", "Wizard"] } },
      text: CAST,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "full-party" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "add-counter-all",
            filter: { type: "creature", controlledBy: "you" },
            counter: "+1/+1",
            amount: 1,
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "deathtouch",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: COMBAT,
    },
  ],
});
