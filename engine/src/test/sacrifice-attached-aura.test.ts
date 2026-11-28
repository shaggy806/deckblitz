/**
 * "Sacrifice an Aura attached to this creature" (Faunsbane Troll): a
 * sacrifice cost whose filter reads its source (`attachedTo: { isSource:
 * true }`) — any Aura on it its controller controls (rule 701.21a), never one
 * on another creature or one an opponent controls.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, enter, keywords, lands, named, pt, ref, spawn, table, toHand, zone } from "./harness.js";

const fightAction = (troll: ObjectId, target: ObjectId, sacrifice?: ObjectId) =>
  ({
    type: "activate-ability",
    player: A,
    source: troll,
    abilityIndex: 0,
    targets: [ref(target)],
    ...(sacrifice !== undefined ? { sacrifice } : {}),
  }) as const;

const offered = (game: Game, troll: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === troll);

describe("Faunsbane Troll", () => {
  it("enters with a Monster Role, and sacrifices it to fight, exiling what dies", () => {
    const { game } = table();
    const troll = enter(game, "Faunsbane Troll");
    const [role] = named(game, "Monster Role Token", A);
    expect(game.state.objects[role].attachedTo).toBe(troll);
    expect(pt(game, troll)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, troll).has("trample")).toBe(true);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 1);
    activate(game, troll, 0, { targets: [ref(giant)], sacrifice: role });
    expect(named(game, "Monster Role Token", A)).toHaveLength(0);
    expect(zone(game, giant)).toBe("exile");
    expect(game.state.objects[troll].damageMarked).toBe(3);
    expect(pt(game, troll)).toEqual({ power: 4, toughness: 4 });
  });

  it("can't be activated with no Aura on it", () => {
    const { game } = table();
    const troll = spawn(game, "Faunsbane Troll");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 1);
    expect(offered(game, troll)).toBe(false);
    expect(game.canDispatch(fightAction(troll, giant))).not.toBeNull();
  });

  it("takes only an Aura of its controller's on it", () => {
    const { game } = table();
    const troll = spawn(game, "Faunsbane Troll");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    // Alice's Rancor on her Grizzly Bears, Bob's Pacifism on the Troll.
    const rancor = spawn(game, "Rancor");
    game.state.objects[rancor].attachedTo = bears;
    const pacifism = spawn(game, "Pacifism", B);
    game.state.objects[pacifism].attachedTo = troll;
    lands(game, "Forest", 1);
    expect(game.canDispatch(fightAction(troll, giant, rancor))).not.toBeNull();
    expect(game.canDispatch(fightAction(troll, giant, pacifism))).not.toBeNull();
    expect(offered(game, troll)).toBe(false);
    // Alice's own Rancor moved onto the Troll pays.
    game.state.objects[rancor].attachedTo = troll;
    expect(offered(game, troll)).toBe(true);
    expect(game.canDispatch(fightAction(troll, giant, rancor))).toBeNull();
  });

  it("activates only as a sorcery", () => {
    const { game } = table();
    const troll = enter(game, "Faunsbane Troll");
    const [role] = named(game, "Monster Role Token", A);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(troll)], settle: false });
    expect(game.canDispatch(fightAction(troll, giant, role))).not.toBeNull();
  });
});
