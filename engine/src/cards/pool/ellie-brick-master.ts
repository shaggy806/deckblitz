import { defineCard } from "../define.js";

// EDHREC rank 11691. Combat Calligrapher's shape: the attacking player makes
// the token, attacking the opponent who was attacked.

const HORDE_TEXT =
  "Distract the Horde — Whenever a player attacks one of your opponents, that attacking player creates a tapped 1/1 black Fungus Zombie creature token named Cordyceps Infected that's attacking that opponent.";

export default defineCard({
  name: "Ellie, Brick Master",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 2,
  toughness: 1,
  pairing: { kind: "partner-group", group: "Survivors" },
  text: `${HORDE_TEXT}\nPartner—Survivors (You can have two commanders if both have this ability.)`,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "opponent" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Cordyceps Infected Token",
        count: 1,
        who: "active-player",
        tapped: true,
        attacking: { player: "trigger-player" },
      },
      resolve: null,
      text: HORDE_TEXT,
    },
  ],
});
