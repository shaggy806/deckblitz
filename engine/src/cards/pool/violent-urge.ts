import { defineCard } from "../define.js";

// EDHREC rank 16255. Delirium is read as it resolves.
export default defineCard({
  name: "Violent Urge",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +1/+0 and gains first strike until end of turn.\nDelirium — If there are four or more card types among cards in your graveyard, that creature gains double strike until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "delirium" },
        then: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      },
    ],
  },
});
