import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 22587.
//
// Bushido 1 (rule 702.45) as two triggers sharing one pump, the way Jukai Trainee and Fumiko
// the Lowblood write it.
const BUSHIDO_TEXT = "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)";
const ENTER_TEXT = "When this creature enters, you may tap target creature.";
const PUMP = { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Kitsune Dawnblade",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Samurai"],
  power: 2,
  toughness: 3,
  text: `${BUSHIDO_TEXT}\n${ENTER_TEXT}`,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO_TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO_TEXT },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "may", prompt: "Tap target creature?", effect: { kind: "tap", target: 0 } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
