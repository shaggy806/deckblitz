import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 9455. The animation is Answered Prayers' "if this isn't a
// creature" gate; a "Construct Hero artifact creature" keeps its other types
// and subtypes (rule 205.1b), Equipment among them, and an Equipment that's a
// creature falls off what it equips (rules 301.5c, 704.5n). The count is a
// granted static (`grant-static`), so it tracks the artifacts you control.

const ENTERS = "When this Equipment enters, attach it to target creature you control.";
const ANIMATE =
  '{2}: If this Equipment isn\'t a creature, it becomes a 0/0 Construct Hero artifact creature with flying and "This creature gets +1/+1 for each artifact you control" until end of turn.';

export default defineCard({
  name: "Iron Man Armor",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\nEquipped creature gets +2/+1 and has flying.\n${ANIMATE}\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      grantKeywords: ["flying"],
      text: "Equipped creature gets +2/+1 and has flying.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { notTypes: ["creature"] } },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "animate",
              target: "source",
              power: 0,
              toughness: 0,
              addTypes: ["creature"],
              addSubtypes: ["Construct", "Hero"],
              keywords: ["flying"],
              duration: "end-of-turn",
            },
            {
              kind: "grant-static",
              target: "source",
              ability: {
                affects: { scope: "self" },
                grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 1] },
                text: "This creature gets +1/+1 for each artifact you control.",
              },
              duration: "end-of-turn",
            },
          ],
        },
      },
      resolve: null,
      text: ANIMATE,
    },
    equip("{2}"),
  ],
});
