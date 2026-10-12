import { defineCard } from "../define.js";

const DEATHTOUCH_TEXT = "Attacking Ninjas you control have deathtouch.";
const DAMAGE_TEXT =
  "Whenever Dark Leo & Shredder deal combat damage to a player, create a 1/1 black Ninja creature token. Then if you control five or more Ninjas, that player loses half their life, rounded up.";

export default defineCard({
  name: "Dark Leo & Shredder",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle", "Human"],
  power: 1,
  toughness: 3,
  sneak: { cost: "{W}{B}" },
  text: `Sneak {W}{B}\n${DEATHTOUCH_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Ninja", attacking: true, controlledBy: "you" } },
      grantKeywords: ["deathtouch"],
      text: DEATHTOUCH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Ninja Token (Dark Leo & Shredder)", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Ninja" }, atLeast: 5 },
            then: { kind: "lose-life", amount: { half: { lifeTotal: "each" }, round: "up" }, who: "trigger-player" },
          },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
