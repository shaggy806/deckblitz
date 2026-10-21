import { defineCard } from "../define.js";

// Everquill Phoenix's token: a red artifact token *named* Feather — keyed
// " Token", named by `tokenName`.

const TEXT = "{1}, Sacrifice Feather: Return target Phoenix card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Feather Token",
  tokenName: "Feather",
  art: "e401e2a8-d0a3-4517-ba20-449a1fff7f85",
  colors: ["R"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Phoenix" } }],
      effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
