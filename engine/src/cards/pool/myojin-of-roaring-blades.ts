import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

const ENTER_TEXT =
  "Myojin of Roaring Blades enters with an indestructible counter on it if you cast it from your hand.";
const BLADES_TEXT =
  "Remove an indestructible counter from Myojin of Roaring Blades: It deals 7 damage to each of up to three targets.";

export default defineCard({
  name: "Myojin of Roaring Blades",
  manaCost: "{5}{R}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 7,
  toughness: 4,
  text: `${ENTER_TEXT}\n${BLADES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "indestructible",
          amount: {
            ifCondition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "indestructible", count: 1 } },
      // "Each of up to three targets": one word "target" over three slots, so
      // each is a different object or player (rule 601.2c), and the damage is
      // dealt to all of them at once.
      targets: distinctTargets(3, "any-target", { optional: true }),
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 7, target: 0 },
          { kind: "damage", amount: 7, target: 1 },
          { kind: "damage", amount: 7, target: 2 },
        ],
      },
      resolve: null,
      text: BLADES_TEXT,
    },
  ],
});
