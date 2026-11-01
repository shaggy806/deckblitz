import { defineCard } from "../define.js";

// Rule 702.16k. The players are fixed as the ability resolves: an opponent who
// gains control of the permanent later in the turn is still one of them (the
// ruling). An object with no controller is its owner's (the ruling).

const TEXT =
  "{T}, Sacrifice this creature: Target permanent you control gains protection from each of your opponents until end of turn. (It can't be blocked, targeted, dealt damage, enchanted, or equipped by anything controlled by those players.)";

export default defineCard({
  name: "Cliffside Rescuer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { controlledBy: "you" } }],
      effect: { kind: "grant-protection", target: 0, from: { fromPlayers: "opponents" }, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
