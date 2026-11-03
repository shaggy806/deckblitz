import { defineCard } from "../define.js";

const JUMP_TEXT = "Jump — During your turn, Kain has flying.";
const TRAITOR_TEXT =
  "Whenever Kain deals combat damage to a player, that player gains control of Kain. If they do, you draw that many cards, create that many tapped Treasure tokens, then lose that much life.";

// "You" stays the trigger's controller: who controlled Kain as it dealt the
// damage.
export default defineCard({
  name: "Kain, Traitorous Dragoon",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 4,
  text: `${JUMP_TEXT}\n${TRAITOR_TEXT}`,
  static: [{ affects: { scope: "self" }, condition: { kind: "your-turn" }, grantKeywords: ["flying"], text: JUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "trigger-player" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "gained-control" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: { triggerValue: true } },
                { kind: "create-token", token: "Treasure Token", count: { triggerValue: true }, tapped: true },
                { kind: "lose-life", amount: { triggerValue: true } },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TRAITOR_TEXT,
    },
  ],
});
