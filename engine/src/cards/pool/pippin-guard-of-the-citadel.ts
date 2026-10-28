import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 3239.
//
// The card type is chosen as the ability resolves: one of the nine (rule
// 300.1).
const TEXT =
  "{T}: Another target creature you control gains protection from the card type of your choice until end of turn. (It can't be blocked, targeted, dealt damage, enchanted, or equipped by anything of that type.)";

export default defineCard({
  name: "Pippin, Guard of the Citadel",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Halfling", "Soldier"],
  power: 2,
  toughness: 2,
  text: `Vigilance, ward {1}\n${TEXT}`,
  keywords: ["vigilance"],
  triggered: [ward({ mana: "{1}" })],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-protection", target: 0, from: { choose: "card-type" }, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
