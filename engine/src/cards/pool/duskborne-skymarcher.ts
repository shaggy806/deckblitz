import { defineCard } from "../define.js";

// EDHREC rank 18950. Ixalan. Kithkin Daggerdare's pump, narrowed to an
// attacking Vampire.
const TEXT = "{W}, {T}: Target attacking Vampire gets +1/+1 until end of turn.";

export default defineCard({
  name: "Duskborne Skymarcher",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Vampire", attacking: true } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
