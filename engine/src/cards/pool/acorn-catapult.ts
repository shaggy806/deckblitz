import { defineCard } from "../define.js";

// Rulings:
//   [2011-09-22] If the ability resolves, but the damage is prevented or redirected, the targeted
//     player or the controller of the targeted creature puts the Squirrel token onto the
//     battlefield, regardless of how much damage was dealt or what the damage was ultimately dealt
//     to.
//   [2011-09-22] If the permanent or player is an illegal target when the ability tries to
//     resolve, it won't resolve and none of its effects will happen. No Squirrel will be created.
//
// `who: "target-controller"` is the targeted player, or the targeted
// permanent's controller as it last existed (a creature the 1 damage killed).

const TEXT =
  "{1}, {T}: This artifact deals 1 damage to any target. That permanent's controller or that player creates a 1/1 green Squirrel creature token.";

export default defineCard({
  name: "Acorn Catapult",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "create-token", token: "Squirrel Token", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
