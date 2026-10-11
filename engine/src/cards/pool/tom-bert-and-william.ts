import { defineCard } from "../define.js";

// EDHREC rank 11079.
//
// Rulings:
//   [2026-06-29] Use the sacrificed creature's power as it last existed on the battlefield to
//     determine how many cards you draw.
//
// "Sacrifice another creature": `otherOnly` keeps them out of their own cost;
// the power is the sacrificed creature's last-known power (rule 608.2h).
// "Return them to the battlefield" names no controller, so they come back
// under the control of the player who puts them there — the trigger's
// controller (rule 110.2a), not necessarily their owner: `underYourControl`.
// As an artifact they lose the creature type and with it Troll (rule
// 205.1a); they keep legendary and the sacrifice ability.
const DRAW_TEXT =
  "{1}, Sacrifice another creature: Draw cards equal to the sacrificed creature's power, then discard a card.";
const RETURN_TEXT =
  "When Tom, Bert, and William die, if they were a creature, return them to the battlefield. They're an artifact. (They're no longer a creature.)";

export default defineCard({
  name: "Tom, Bert, and William",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 5,
  toughness: 5,
  text: `${DRAW_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "creature", controlledBy: "you" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { powerOf: "sacrificed" } },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "source", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true, setTypes: ["artifact"] },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
