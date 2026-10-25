import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 12350.
//
// Rulings:
//   [2014-07-18] You decide whether to pay {W} as the triggered ability resolves. You may only pay
//     {W} and create a Spirit token once per nontoken creature.
//   [2014-07-18] You can sacrifice any Spirit to activate the last ability, not just a Spirit
//     token created by Spirit Bonds.

const TRIGGER =
  "Whenever a nontoken creature you control enters, you may pay {W}. If you do, create a 1/1 white Spirit creature token with flying.";
const ACTIVATED = "{1}{W}, Sacrifice a Spirit: Target non-Spirit creature gains indestructible until end of turn.";

export default defineCard({
  name: "Spirit Bonds",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${TRIGGER}\n${ACTIVATED} (Damage and effects that say "destroy" don't destroy it.)`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, sacrifice: { filter: { subtype: "Spirit" } } },
      targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Spirit"] } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: ACTIVATED,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: false, type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {W} to create a 1/1 Spirit with flying?",
        cost: "{W}",
        effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
