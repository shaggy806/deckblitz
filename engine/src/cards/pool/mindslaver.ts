import { defineCard } from "../define.js";

// Rule 723: the target's next turn, the one they actually take, and all of it.
// Only the player is controlled (723.3), so everything but who answers runs as
// usual (`player-control.ts`). Targeting yourself does nothing (723.9).
export default defineCard({
  name: "Mindslaver",
  manaCost: "{6}",
  types: ["artifact"],
  supertypes: ["legendary"],
  text: "{4}, {T}, Sacrifice Mindslaver: You control target player during that player's next turn. (You see all cards that player could see and make all decisions for them.)",
  activated: [
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "control-player", target: 0 },
      resolve: null,
      text: "{4}, {T}, Sacrifice Mindslaver: You control target player during that player's next turn.",
    },
  ],
});
