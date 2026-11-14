import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { attack, settle, spawn, table } from "./harness.js";

// An aggregate's `excludeGranter`: "for each Aura and Equipment attached to
// this creature other than Animal Friend" leaves out the Aura granting the
// ability, by identity — another Animal Friend still counts — live or as the
// creature last existed (rule 608.2h).

const attachTo = (game: Game, host: ObjectId, ...names: string[]): ObjectId[] =>
  names.map((name) => {
    const id = spawn(game, name);
    game.state.objects[id].attachedTo = host;
    return id;
  });

const squirrelCounters = (game: Game): number[] =>
  Object.values(game.state.objects)
    .filter((o) => o.zone === "battlefield" && o.cardName === "Squirrel Token")
    .map((o) => o.counters?.["+1/+1"] ?? 0)
    .sort();

describe("Animal Friend — other than Animal Friend", () => {
  it("alone, its Squirrel gets no counters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, bears, "Animal Friend");
    attack(game, a, [bears]);
    expect(squirrelCounters(game)).toEqual([0]);
  });

  it("counts the other Auras and Equipment, a second Animal Friend among them", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, bears, "Animal Friend", "Animal Friend", "Bonesplitter");
    attack(game, a, [bears]);
    // Two granted triggers, each leaving out only its own Animal Friend.
    expect(squirrelCounters(game)).toEqual([2, 2]);
  });

  it("with the creature gone before it resolves, counts what was attached as it last existed", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, bears, "Animal Friend", "Bonesplitter", "Short Sword");
    a.declareAttackersFn = () => [{ attacker: bears, defender: game.state.turnOrder[1]! }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length > 0);
    game.debugMove(bears, "graveyard");
    settle(game);
    expect(squirrelCounters(game)).toEqual([2]);
  });
});
