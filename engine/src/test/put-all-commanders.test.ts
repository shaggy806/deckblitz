/**
 * "Put all commanders you own from the command zone and from your graveyard
 * into your hand" — `return-from-graveyard`'s `from:
 * "command-zone-and-graveyard"` with `count: "all"` (Campfire), each
 * commander's owner free to keep it in the command zone (rule 903.9b).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, hand, lands, life, spawn, table, toGraveyard, zone } from "./harness.js";

function commander(game: Game, name: string, player: PlayerId, where: "command" | "graveyard"): ObjectId {
  const id = game.debugSpawn(name, player, where);
  game.state.objects[id].isCommander = true;
  return id;
}

describe("Campfire", () => {
  it("{1}, {T}: you gain 2 life", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const fire = spawn(game, "Campfire");
    activate(game, fire, 0);
    expect(life(game)).toBe(22);
  });

  it("puts every commander you own from the command zone and your graveyard into your hand, then shuffles the rest of the graveyard into the library", () => {
    const { game, a } = table({ deck: "Forest" });
    a.commanderReplacementFn = () => false;
    lands(game, "Wastes", 2);
    const fire = spawn(game, "Campfire");
    const waiting = commander(game, "Craw Wurm", A, "command");
    const partner = commander(game, "Hill Giant", A, "command");
    const dead = commander(game, "Grizzly Bears", A, "graveyard");
    const plain = toGraveyard(game, "Grizzly Bears");
    const theirs = commander(game, "Serra Angel", B, "command");
    const theirDead = commander(game, "Serra Angel", B, "graveyard");
    activate(game, fire, 1);
    expect(zone(game, fire)).toBe("exile");
    expect(hand(game)).toEqual(expect.arrayContaining([waiting, partner, dead]));
    expect(zone(game, plain)).toBe("library");
    expect(game.state.zones.perPlayer[A].graveyard).toEqual([]);
    expect(zone(game, theirs)).toBe("command");
    expect(zone(game, theirDead)).toBe("graveyard");
  });

  it("a commander in the graveyard may go to the command zone instead, and isn't shuffled in (rule 903.9b)", () => {
    const { game, a } = table({ deck: "Forest" });
    a.commanderReplacementFn = () => true;
    lands(game, "Wastes", 2);
    const fire = spawn(game, "Campfire");
    const waiting = commander(game, "Craw Wurm", A, "command");
    const dead = commander(game, "Grizzly Bears", A, "graveyard");
    const plain = toGraveyard(game, "Hill Giant");
    activate(game, fire, 1);
    expect(zone(game, waiting)).toBe("hand");
    expect(zone(game, dead)).toBe("command");
    expect(zone(game, plain)).toBe("library");
  });

  it("with no commander anywhere, it still shuffles the graveyard in", () => {
    const { game } = table({ deck: "Forest" });
    lands(game, "Wastes", 2);
    const fire = spawn(game, "Campfire");
    const plain = toGraveyard(game, "Grizzly Bears");
    activate(game, fire, 1);
    expect(zone(game, plain)).toBe("library");
  });
});
