import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// "Any opponent may": each opponent in turn order may tap one, even after an
// earlier one has; however many do, one Fish a combat (its rulings) — the
// `this-way` tapped, once, after everyone has chosen, as Desecration Demon's
// sacrifice. Players choose without knowing whom the Kraken will attack.
const COMBAT_TEXT =
  "At the beginning of each combat, if this creature is untapped, any opponent may tap an untapped creature they " +
  "control. If they do, tap this creature and create a 1/1 blue Fish creature token with \"This token can't be blocked.\"";

export default defineCard({
  name: "Reservoir Kraken",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample, ward {2}\n${COMBAT_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      condition: { kind: "source", filter: { tapped: false } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "each-player-may",
            who: "each-opponent",
            options: [
              {
                tapPermanent: { type: "creature", controlledBy: "you", tapped: false },
                text: "Tap an untapped creature you control",
              },
            ],
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "tapped", atLeast: 1 },
            then: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: "source" },
                { kind: "create-token", token: "Fish Token (Expendable Lackey)", count: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
