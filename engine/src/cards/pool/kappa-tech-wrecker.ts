import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// EDHREC rank 9869.
//
// "You may remove a deathtouch counter from it" is Forgehammer Centurion's
// shape: offered only while it's on the battlefield with one to remove; "when
// you do" is a reflexive trigger (rule 603.12) that targets as it goes on the
// stack — an artifact or enchantment controlled by the player it damaged.
const ENTER_TEXT = "This creature enters with a deathtouch counter on it.";
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, you may remove a deathtouch counter from it. When you do, exile target artifact or enchantment that player controls.";

export default defineCard({
  name: "Kappa Tech-Wrecker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Turtle", "Ninja"],
  power: 1,
  toughness: 3,
  text: `${ninjutsuText("{1}{G}")}\n${ENTER_TEXT}\n${DAMAGE_TEXT}`,
  activated: [ninjutsu("{1}{G}")],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "deathtouch", amount: 1 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "deathtouch", compare: { op: "gte", n: 1 } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Remove a deathtouch counter from Kappa Tech-Wrecker?",
          effect: { kind: "remove-counter", target: "source", counter: "deathtouch", amount: 1 },
          then: {
            kind: "reflexive-trigger",
            targets: [
              {
                kind: "permanent",
                whose: "trigger-player",
                filter: { typesAnyOf: ["artifact", "enchantment"] },
              },
            ],
            effect: { kind: "exile", target: 0 },
            text: "When you do, exile target artifact or enchantment that player controls.",
          },
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
