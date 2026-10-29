import { defineCard } from "../define.js";

const UNBLOCKABLE = "This creature can't be blocked.";
const HIT =
  "Whenever this creature deals combat damage to a player, that player reveals their hand. You choose a card from it. That player exiles that card.";

export default defineCard({
  name: "Ghastlord of Fugue",
  manaCost: "{U/B}{U/B}{U/B}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 4,
  toughness: 4,
  text: `${UNBLOCKABLE}\n${HIT}`,
  static: [{ affects: { scope: "self" }, grantKeywords: ["unblockable"], text: UNBLOCKABLE }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard-chosen", target: "trigger-player", destination: "exile", unlinked: true },
      resolve: null,
      text: HIT,
    },
  ],
});
