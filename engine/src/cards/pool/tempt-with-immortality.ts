import { defineCard } from "../define.js";

// EDHREC rank 13651. Tempting offer as Tempt with Vengeance has it: each
// opponent, in turn order from you (the caster is the active player), may
// return a creature card from their own graveyard — "you" in their effect is
// them. "For each opponent who does" counts an opponent who actually put one
// onto the battlefield (`this-way`, by the player it entered under), so
// accepting with no creature card in their graveyard gives you nothing. No
// card is targeted; each is chosen as the spell resolves (the ruling).
const RETURN = {
  kind: "return-from-graveyard",
  filter: { type: "creature" },
  destination: "battlefield",
  count: 1,
} as const;

export default defineCard({
  name: "Tempt with Immortality",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Tempting offer — Return a creature card from your graveyard to the battlefield. Each opponent may return a creature card from their graveyard to the battlefield. For each opponent who does, return a creature card from your graveyard to the battlefield.",
  effect: {
    kind: "sequence",
    effects: [
      RETURN,
      {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Return a creature card from your graveyard to the battlefield?",
        effect: RETURN,
        ifDid: {
          kind: "conditional",
          condition: { kind: "this-way", what: "put-onto-battlefield", who: "that-player", atLeast: 1 },
          then: RETURN,
        },
      },
    ],
  },
});
