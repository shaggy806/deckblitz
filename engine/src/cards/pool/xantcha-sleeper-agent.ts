import { defineCard } from "../define.js";

// Rulings:
//   Xantcha's controller may activate its last ability. In this case, the same player loses 2 life
//     and draws a card.
//   Xantcha's first ability is a replacement effect that modifies how it enters the battlefield, not
//     a triggered ability. Players can't take actions while Xantcha's on the battlefield before it's
//     controlled by another player.
//   The player who draws a card when Xantcha's last ability resolves is the player who activated the
//     ability.
//   If a player creates a token that's a copy of Xantcha, the player who creates the token is its
//     owner, not the player under whose control it enters the battlefield.
//   In a multiplayer game, if Xantcha's owner leaves the game, Xantcha leaves the game with them. If
//     Xantcha's controller leaves the game, Xantcha is exiled.
const ENTERS = "Xantcha enters under the control of an opponent of your choice.";
const ATTACKS = "Xantcha attacks each combat if able and can't attack its owner or planeswalkers its owner controls.";
const ANYONE = "{3}: Xantcha's controller loses 2 life and you draw a card. Any player may activate this ability.";

export default defineCard({
  name: "Xantcha, Sleeper Agent",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Minion"],
  power: 5,
  toughness: 5,
  text: `${ENTERS}\n${ATTACKS}\n${ANYONE}`,
  choosePlayerOnEnter: "opponent",
  entersUnderChosenPlayer: true,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack", "cant-attack-owner", "cant-attack-owner-planeswalkers"],
      text: ATTACKS,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "source-controller" },
          { kind: "draw", amount: 1 },
        ],
      },
      anyPlayer: true,
      resolve: null,
      text: ANYONE,
    },
  ],
});
