import { defineCard } from "../define.js";

// EDHREC 3653 (batch 315). Two different players are chosen as it enters,
// its controller among them if they like (its ruling): `chooseTwoPlayersOnEnter`.
// Each damage event to either one triggers it once, and the other loses that
// much life — life loss, not damage, and not from the damage's source (its
// ruling). Dealt lethal damage at the same time, Sower's ability still
// resolves, read off it as it last existed (rule 608.2h).
const DISCORD_TEXT = "Whenever damage is dealt to one of the chosen players, the other chosen player also loses that much life.";

export default defineCard({
  name: "Sower of Discord",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  choosePlayerOnEnter: "player",
  chooseTwoPlayersOnEnter: true,
  text: `Flying\nAs this creature enters, choose two players.\n${DISCORD_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "chosen-players" },
      targets: [],
      effect: { kind: "lose-life", amount: { triggerValue: true }, who: "other-chosen-player" },
      resolve: null,
      text: DISCORD_TEXT,
    },
  ],
});
