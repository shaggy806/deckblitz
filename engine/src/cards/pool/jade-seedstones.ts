import { defineCard } from "../define.js";

// The targets and the division are chosen as the trigger goes on the stack,
// at least one counter each; a target gone illegal loses its share (the
// rulings — rules 603.3d, 608.2b).

const ENTER_TEXT =
  "When this artifact enters, distribute three +1/+1 counters among one, two, or three target creatures you control.";

export default defineCard({
  name: "Jade Seedstones",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\nCraft with creature {5}{G}{G} ({5}{G}{G}, Exile this artifact, Exile a creature you control or a creature card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)`,
  activated: [
    {
      cost: {
        mana: "{5}{G}{G}",
        tap: false,
        exileSelf: true,
        craft: { count: 1, filter: { type: "creature" }, text: "creature" },
      },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "craft-return" },
      resolve: null,
      text: "Craft with creature {5}{G}{G}",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature-you-control", min: 1, max: 3 }],
      divided: { total: 3, slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Jade Seedstones", "Jadeheart Attendant"],
  transform: true,
});
