import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 12781.
//
// Spell mastery is checked as it resolves, after the draw (the ruling: a dredge in place of the
// draw can enable it). With it, every creature you control gets one regeneration shield, and the
// target gets its own only if you don't control it — "each other creature you control" never
// gives a target you control a second shield. An illegal target stops all of it (the ruling).
const MASTERY = {
  kind: "cards-in-graveyard",
  atLeast: 2,
  filter: { typesAnyOf: ["instant", "sorcery"] },
} as const;

export default defineCard({
  name: "Dark Dabbling",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Regenerate target creature. Draw a card. (The next time the creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, also regenerate each other creature you control.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      {
        kind: "conditional",
        condition: MASTERY,
        then: {
          kind: "sequence",
          effects: [
            { kind: "regenerate-all", filter: { type: "creature", controlledBy: "you" } },
            {
              kind: "conditional",
              condition: { kind: "not", of: { kind: "target", index: 0, filter: { controlledBy: "you" } } },
              then: { kind: "regenerate", target: 0 },
            },
          ],
        },
        else: { kind: "regenerate", target: 0 },
      },
    ],
  },
});
