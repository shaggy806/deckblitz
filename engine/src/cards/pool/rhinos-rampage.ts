import { defineCard } from "../define.js";

// EDHREC rank 11967. Marvel's Spider-Man. Only the excess dealt to the
// opponent's creature in the fight counts (`to: 1`); "when … this way" is a
// reflexive trigger (rule 603.12), its target chosen as it's put on the stack.

const REFLEXIVE_TEXT =
  "When excess damage is dealt to the creature an opponent controls this way, destroy up to one target noncreature artifact with mana value 3 or less.";

export default defineCard({
  name: "Rhino's Rampage",
  manaCost: "{R/G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: `Target creature you control gets +1/+0 until end of turn. It fights target creature an opponent controls. ${REFLEXIVE_TEXT}`,
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1 },
      {
        kind: "conditional",
        condition: { kind: "excess-damage-this-way", to: 1 },
        then: {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "optional",
              of: {
                kind: "permanent",
                filter: { type: "artifact", notTypes: ["creature"], manaValue: { op: "lte", n: 3 } },
              },
            },
          ],
          effect: { kind: "destroy", target: 0 },
          text: REFLEXIVE_TEXT,
        },
      },
    ],
  },
});
