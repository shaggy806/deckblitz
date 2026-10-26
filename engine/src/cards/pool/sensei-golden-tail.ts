import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

// Champions of Kamigawa (CHK). EDHREC rank 16236. The training counter is only a
// marker: the bushido and the Samurai type are granted for good, so removing the
// counter changes nothing (the ruling); each instance of bushido triggers on
// its own (the other ruling).
//
// Rulings:
//   [2004-12-01] Note that multiple instances of the bushido ability each trigger separately.
//   [2004-12-01] The training counter just marks which creatures have been changed; an effect that
//     removes the counter doesn't change the creature's types or abilities.
const BUSHIDO = "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)";
const TRAIN =
  "{1}{W}, {T}: Put a training counter on target creature. That creature gains bushido 1 and becomes a Samurai in addition to its other creature types. Activate only as a sorcery.";

const [blocks, blocked] = bushido(1);

export default defineCard({
  name: "Sensei Golden-Tail",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fox", "Samurai"],
  power: 2,
  toughness: 1,
  text: `${BUSHIDO}\n${TRAIN}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "training", amount: 1 },
          { kind: "grant-triggered", target: 0, ability: blocks, duration: "permanent" },
          { kind: "grant-triggered", target: 0, ability: blocked, duration: "permanent" },
          { kind: "add-types", target: 0, addSubtypes: ["Samurai"], duration: "permanent" },
        ],
      },
      resolve: null,
      text: TRAIN,
      sorcerySpeed: true,
    },
  ],
  triggered: bushido(1),
});
