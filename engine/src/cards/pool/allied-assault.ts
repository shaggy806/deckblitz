import { defineCard } from "../define.js";

// Rulings:
//   The value of X is determined only as Allied Assault resolves. Once that happens, the
//   value of X won't change later in the turn even if the number of creatures in your
//   party changes.

export default defineCard({
  name: "Allied Assault",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Up to two target creatures each get +X/+X until end of turn, where X is the number of creatures in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)",
  targets: [{ kind: "any-number", of: "creature", max: 2 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "modify-pt",
      target: 0,
      power: { partySize: "you" },
      toughness: { partySize: "you" },
      duration: "end-of-turn",
    },
  },
});
