import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may return target creature card with infect from your graveyard to your hand.";

export default defineCard({
  name: "Corpse Cur",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Dog"],
  power: 2,
  toughness: 2,
  keywords: ["infect"],
  text: `Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", keyword: "infect" } }],
      effect: {
        kind: "may",
        prompt: "Return target creature card with infect from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
