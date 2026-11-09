import { defineCard } from "../define.js";

// +1: the card comes back at its owner's next end step — this turn's when it's
// the Wanderer's controller's own card, an opponent's on their turn — the
// delayed return still the controller's (rule 603.7e). −4: you make every
// choice as it resolves, none a target; a player with one creature keeps it
// unasked, and everything else is sacrificed at once.

const LIMIT = "No more than one creature can attack The Eternal Wanderer each combat.";
const PLUS =
  "+1: Exile up to one target artifact or creature. Return that card to the battlefield under its owner's control at the beginning of that player's next end step.";
const ZERO = "0: Create a 2/2 white Samurai creature token with double strike.";
const MINUS =
  "−4: For each player, choose a creature that player controls. Each player sacrifices all creatures they control not chosen this way.";

export default defineCard({
  name: "The Eternal Wanderer",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  loyalty: 5,
  text: `${LIMIT}\n${PLUS}\n${ZERO}\n${MINUS}`,
  static: [{ affects: { scope: "self" }, attackLimit: { most: 1, covers: "self" }, text: LIMIT }],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: { step: "end", whose: "you" },
        returnOnOwnersTurn: true,
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Samurai Token (The Eternal Wanderer)", count: 1 },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            who: "you",
            for: { permanent: { type: "creature" }, about: "each-player", keep: true },
          },
          { kind: "sacrifice-all", who: "each-player", filter: { type: "creature", notThisWay: "chosen" } },
        ],
      },
      resolve: null,
      text: MINUS,
    },
  ],
});
