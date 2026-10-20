import { defineCard } from "../define.js";

// EDHREC rank 13012.
//
// Rulings:
//   [2021-09-24] You will create a Zombie creature token even if the spell's controller pays {4}.

export default defineCard({
  name: "Flip the Switch",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {4}. Create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{4}", text: "Pay {4}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      { kind: "create-token", token: "Zombie Token (Crowded Crypt)", count: 1 },
    ],
  },
});
