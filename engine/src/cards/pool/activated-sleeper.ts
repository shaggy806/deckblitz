import { defineCard } from "../define.js";

// Declining, it's a 0/0 (its ruling).
export default defineCard({
  name: "Activated Sleeper",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Shapeshifter"],
  power: 0,
  toughness: 0,
  keywords: ["flash"],
  text:
    "Flash\nYou may have this creature enter as a copy of any creature card in a graveyard that was put there from " +
    "the battlefield this turn, except it's a Phyrexian in addition to its other types.",
  copyOnEnter: {
    filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
    from: "graveyards",
    except: { addSubtypes: ["Phyrexian"] },
  },
});
