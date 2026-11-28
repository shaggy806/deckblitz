import { defineCard } from "../define.js";

// EDHREC rank 28287. The Dark.
//
// "Lands can't enter the battlefield" is an `enter` prohibition read as the
// permanent would enter (`asEntering`): a land put onto the battlefield by an
// effect stays where it is, a Clone entering as a copy of a land goes to its
// owner's graveyard instead, and a land token isn't created (rule 111.5).
// The upkeep trigger is Prowling Pangolin's "any player may": each player in
// turn is offered both, knowing what those before did, and if any did either,
// this enchantment is destroyed — once (rule 400.7).

const LANDS_PLAY = "Players can't play lands.";
const LANDS_ENTER = "Lands can't enter the battlefield.";
const UPKEEP =
  "At the beginning of each upkeep, any player may sacrifice two lands of their choice or have this enchantment deal 5 damage to that player. If a player does either, destroy this enchantment.";

export default defineCard({
  name: "Worms of the Earth",
  manaCost: "{2}{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${LANDS_PLAY}\n${LANDS_ENTER}\n${UPKEEP}`,
  static: [
    { affects: { scope: "self" }, prohibits: [{ act: "play-land", who: "each-player" }], text: LANDS_PLAY },
    { affects: { scope: "self" }, prohibits: [{ act: "enter", object: { type: "land" }, asEntering: true }], text: LANDS_ENTER },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [
          { sacrifice: { type: "land", controlledBy: "you" }, count: 2, text: "Sacrifice two lands" },
          { takeDamage: 5, text: "Have Worms of the Earth deal 5 damage to you" },
        ],
        ifDid: { kind: "destroy", target: "source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
