import { defineCard } from "../define.js";

// EDHREC rank 15471.

export default defineCard({
  name: "Startle",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature gets -2/-0 until end of turn. Create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" },
      { kind: "create-token", token: "Zombie Token (Crowded Crypt)", count: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
