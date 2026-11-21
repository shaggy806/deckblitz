/**
 * `look-and-choose`'s `zone: "hand-and-command"`: one choice over the
 * chooser's hand and the cards they own in the command zone — Next of Kin's
 * "you may put a creature card you own with lesser mana value from your hand
 * or from the command zone onto the battlefield. If you do, return this card
 * to the battlefield attached to that creature at the beginning of the next
 * end step."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, destroy, lands, pickFromZone, pickTargets, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

function commander(game: Game, name: string, player: PlayerId): ObjectId {
  const id = game.debugSpawn(name, player, "command");
  game.state.objects[id].isCommander = true;
  return id;
}

/** Next of Kin on a Hill Giant (mana value 4) of Alice's. */
function enchanted(game: Game, a: Parameters<typeof pickTargets>[0]): { giant: ObjectId; kin: ObjectId } {
  lands(game, "Forest", 3);
  const giant = spawn(game, "Hill Giant");
  const kin = toHand(game, "Next of Kin");
  pickTargets(a, giant);
  cast(game, kin, { targets: [ref(giant)] });
  expect(game.state.objects[kin].attachedTo).toBe(giant);
  return { giant, kin };
}

describe("Next of Kin", () => {
  it("offers lesser mana value creature cards from the hand and the command zone; the Aura returns on the one put", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears");
    toHand(game, "Colossal Dreadmaw");
    toHand(game, "Lightning Bolt");
    const general = commander(game, "Llanowar Elves", A);
    commander(game, "Savannah Lions", B);
    const { giant, kin } = enchanted(game, a);
    const seen = pickFromZone(a, general);
    destroy(game, giant);
    expect([...seen.offered].sort()).toEqual([bears, general].sort());
    expect(zone(game, general)).toBe("battlefield");
    expect(zone(game, kin)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, kin)).toBe("battlefield");
    expect(game.state.objects[kin].attachedTo).toBe(general);
  });

  it("a hand's card put; declined, nothing is set up and the Aura stays in the graveyard", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears");
    const { giant, kin } = enchanted(game, a);
    pickFromZone(a, bears);
    destroy(game, giant);
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[kin].attachedTo).toBe(bears);

    const second = table();
    const otherBears = toHand(second.game, "Grizzly Bears");
    const other = enchanted(second.game, second.a);
    pickFromZone(second.a);
    destroy(second.game, other.giant);
    expect(zone(second.game, otherBears)).toBe("hand");
    toStep(second.game, "end");
    settle(second.game);
    expect(zone(second.game, other.kin)).toBe("graveyard");
  });
});
