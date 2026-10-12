import { defineCard } from "../define.js";

// Teamwork changes the target (rule 702.194c): chosen as the spell is cast,
// with the teamwork cost declared before it (601.2b-c).
export default defineCard({
  name: "Too Evil to Stay Dead",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Teamwork 4 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 4 or more.)\n" +
    "Choose target creature card in your graveyard with mana value 4 or less. If this spell was cast using teamwork, instead choose target creature card in your graveyard. Return the chosen card to the battlefield.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 4 } } }],
  effect: { kind: "put-onto-battlefield", target: 0 },
  kicker: {
    cost: "",
    keyword: "teamwork",
    teamwork: 4,
    targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  },
});
