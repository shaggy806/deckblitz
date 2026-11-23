import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever The Ice Dancer deals combat damage to a player, create a Gold token. Then you draw X cards and gain X life, where X is the number of artifact tokens you control. The Ice Dancer deals X damage to each opponent.";

export default defineCard({
  name: "The Ice Dancer",
  manaCost: "{R}{W}{U}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Athlete"],
  power: 2,
  toughness: 2,
  text: `{2}, {Q}: The Ice Dancer gains flying until end of turn. ({Q} is the untap symbol.)\n${DAMAGE_TEXT} (A Gold token is an artifact with "Sacrifice this token: Add one mana of any color.")`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, untap: true },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{2}, {Q}: The Ice Dancer gains flying until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Gold Token", count: 1 },
          // X counted once, after the Gold token is made, for all three.
          {
            kind: "with-x",
            x: { countOf: { type: "artifact", token: true, controlledBy: "you" } },
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: "x" },
                { kind: "gain-life", amount: "x" },
                { kind: "damage", amount: "x", who: "each-opponent" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
