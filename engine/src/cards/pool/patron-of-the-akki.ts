import { defineCard } from "../define.js";

const TEXT = "Whenever Patron of the Akki attacks, creatures you control get +2/+0 until end of turn.";

export default defineCard({
  name: "Patron of the Akki",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 5,
  kicker: { cost: "", keyword: "offering", flash: true, offering: { subtype: "Goblin" } },
  text: `Goblin offering (You may cast this spell any time you could cast an instant by sacrificing a Goblin and paying the difference in mana costs between this and the sacrificed Goblin. Mana cost includes color.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
