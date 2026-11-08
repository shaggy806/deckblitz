import { defineCard } from "../define.js";

export default defineCard({
  name: "Idol of Endurance",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: "When this artifact enters, exile all creature cards with mana value 3 or less from your graveyard until this artifact leaves the battlefield.\n{1}{W}, {T}: Until end of turn, you may cast a creature spell from among cards exiled with this artifact without paying its mana cost.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: "When this artifact enters, exile all creature cards with mana value 3 or less from your graveyard until this artifact leaves the battlefield.",
      targets: [],
      effect: {
        kind: "exile-graveyard",
        target: "you",
        filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        untilSourceLeaves: true,
        linked: true,
      },
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      resolve: null,
      text: "{1}{W}, {T}: Until end of turn, you may cast a creature spell from among cards exiled with this artifact without paying its mana cost.",
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "exile", linked: true, spell: { type: "creature" }, free: true, upTo: 1 } },
    },
  ],
});
