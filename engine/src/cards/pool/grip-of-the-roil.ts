import { defineCard } from "../define.js";

// EDHREC rank 24365.
export default defineCard({
  name: "Grip of the Roil",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  alternativeCost: {
    mana: "{1}{U}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {1}{U} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nTap target creature. It doesn't untap during its controller's next untap step.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "draw", amount: 1 },
    ],
  },
});
