import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 24729. Whether the card is a Goblin is read as
// the ability resolves (the ruling), while it's still the targeted card in
// the graveyard; with the target gone the whole ability fizzles, so no haste.
const TEXT =
  "When this creature enters, return target creature card from your graveyard to your hand. If that card is a Goblin card, this creature gains haste until end of turn.";

export default defineCard({
  name: "Warren Pilferers",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { subtype: "Goblin" } },
            then: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
          },
          { kind: "return-to-hand", target: 0, from: "graveyard" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
