import { defineCard } from "../define.js";

// EDHREC rank 11314.
//
// Steward of the Harvest's "up to three target land cards" group, put onto
// the battlefield tapped as one event; "that many" is the land cards that
// actually came back (`thisWay: "put-onto-battlefield"`) — one exiled in
// response is one token fewer (the ruling).
const TEXT =
  "Return up to three target land cards from your graveyard to the battlefield tapped. Create that many 4/2 green Plant Warrior creature tokens with reach.";

export default defineCard({
  name: "Vengeful Regrowth",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{6}{G}{G}" },
  text: `${TEXT}\nFlashback {6}{G}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "land" } }, max: 3 }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
        simultaneous: true,
      },
      { kind: "create-token", token: "Plant Warrior Token", count: { thisWay: "put-onto-battlefield" } },
    ],
  },
});
