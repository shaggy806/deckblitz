import { defineCard } from "../define.js";

// The creature is chosen at random among those this card could enchant
// (`enchantableBy`, rule 303.4: protection from red bars one, shroud doesn't —
// it isn't targeted; both rulings), and the card returns only from the
// graveyard it went to (`fromGraveyard`, rule 400.7), under the ability's
// controller's control (110.2a). With no such creature it stays (303.4g).

const PUMP_TEXT = "Enchanted creature gets +2/-1.";
const DIES_TEXT =
  "When enchanted creature dies, choose a creature at random this Aura can enchant. Return this card to the battlefield attached to that creature.";

export default defineCard({
  name: "Infectious Rage",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\n${DIES_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, -1], text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        random: true,
        filter: { type: "creature", enchantableBy: "source" },
        upTo: 1,
        prompt: "A creature this Aura can enchant, at random",
        then: { kind: "put-onto-battlefield", target: "source", fromGraveyard: true, underYourControl: true, attachedTo: 0 },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
