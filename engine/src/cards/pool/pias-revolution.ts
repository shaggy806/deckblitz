import { defineCard } from "../define.js";

// EDHREC rank 7210.
//
// The punisher is the targeted opponent's choice, made as the ability resolves
// (Risk Factor's shape): be dealt 3 damage by this enchantment, or let the
// artifact card come back. The return is of the card as the trigger saw it, so
// one that has left the graveyard since stays where it is (ruling). The trigger
// is on the owner's graveyard, whoever controlled the artifact (ruling).
//
// Rulings:
//   [2017-02-09] The target opponent chooses whether to have Pia's Revolution deal 3 damage to
//     them as its ability resolves. You won't return the card to your hand if that player chooses
//     to be dealt damage or if the card leaves the graveyard before the ability resolves.
//   [2017-02-09] It doesn't matter who controlled the artifact when it was put into your
//     graveyard. Pia's Revolution's ability will trigger if you own that artifact.
//   [2017-02-09] If there are no legal targets for Pia's Revolution's ability (perhaps because
//     each of your opponents has hexproof), it will be removed from the stack with no effect.
//   [2017-02-09] If a nontoken artifact is put into your graveyard at the same time as Pia's
//     Revolution, Pia's Revolution's ability triggers.

const TEXT =
  "Whenever a nontoken artifact is put into your graveyard from the battlefield, return that card to your hand unless target opponent has this enchantment deal 3 damage to them.";

export default defineCard({
  name: "Pia's Revolution",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "any",
        to: ["graveyard"],
        filter: { type: "artifact", token: false, ownedBy: "you" },
      },
      targets: ["opponent"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        choices: [
          { text: "Have Pia's Revolution deal 3 damage to you.", effect: { kind: "damage", target: 0, amount: 3 } },
          {
            text: "Let them return the artifact card to their hand.",
            effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
