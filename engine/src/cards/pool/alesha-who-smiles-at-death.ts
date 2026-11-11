import { defineCard } from "../define.js";

// The target is chosen as the trigger goes on the stack; the {W/B}{W/B} is
// offered as it resolves, once (its ruling). The card returns tapped and
// attacking a player or planeswalker its controller chooses (rule 508.4).
export default defineCard({
  name: "Alesha, Who Smiles at Death",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text:
    "First strike\n" +
    "Whenever Alesha attacks, you may pay {W/B}{W/B}. If you do, return target creature card with power 2 or less from your graveyard to the battlefield tapped and attacking.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: {
        kind: "may",
        prompt: "Pay {W/B}{W/B} to return that card tapped and attacking?",
        cost: "{W/B}{W/B}",
        effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true, attacking: "choose" },
      },
      resolve: null,
      text: "Whenever Alesha attacks, you may pay {W/B}{W/B}. If you do, return target creature card with power 2 or less from your graveyard to the battlefield tapped and attacking.",
    },
  ],
});
