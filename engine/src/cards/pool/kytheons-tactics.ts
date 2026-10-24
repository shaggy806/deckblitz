import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 26387.
//
// "Those creatures" are the creatures you control as it resolves — the same set both effects read
// in the one resolution. Spell mastery is checked then too.
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Kytheon's Tactics",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Creatures you control get +2/+1 until end of turn.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, those creatures also gain vigilance until end of turn. (Attacking doesn't cause them to tap.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: YOURS, power: 2, toughness: 1, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
        then: { kind: "grant-keyword-all", filter: YOURS, keyword: "vigilance", duration: "end-of-turn" },
      },
    ],
  },
});
