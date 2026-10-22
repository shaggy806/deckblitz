import { defineCard } from "../define.js";

// An intervening-if (rule 603.4): either half true as it triggers, either half
// true as it resolves (its ruling).
const ATTACK_TEXT =
  "Whenever this creature attacks, if you control a Desert or there is a Desert card in your graveyard, target creature can't block this turn.";

export default defineCard({
  name: "Gilded Cerodon",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
          { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Desert" } },
        ],
      },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
