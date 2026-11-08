import { describe, expect, it } from "vitest";
import { A, B, C, D, destroy, enter, named, pickModes, pickPermanents, pt, settle, spawn, table, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

// Zenos yae Galvus // Shinryu, Transcendent Rival: a permanent chosen as an
// enters ability resolves, kept for a later trigger (`choose-permanents {
// remember }`, `who: "chosen"`); a choice made as a permanent transforms
// (`choosePlayerOnTransform`, rule 712.20); and a trigger on a player losing
// the game (`on: "event", event: "loses-game"`, rule 104.3).

const face = (game: Game, id: ObjectId): number => game.state.objects[id].face ?? 0;
const lose = (game: Game, player: PlayerId): void => {
  game.debugApplyEffect(player, { kind: "lose-game" }, []);
  settle(game);
};

describe("Zenos yae Galvus: the chosen creature", () => {
  it("spares Zenos and the chosen creature from the -2/-2 and remembers the choice", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const giant = spawn(game, "Hill Giant", A);
    const offered = pickPermanents(a, bears);
    const zenos = enter(game, "Zenos yae Galvus");
    expect(offered.offered).toEqual(expect.arrayContaining([bears, elves]));
    expect(offered.offered).not.toContain(giant);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, elves)).toBe("graveyard");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, zenos)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[zenos].chosenPermanent?.id).toBe(bears);
    expect(face(game, zenos)).toBe(0);
  });

  it("transforms when the chosen creature leaves, and in two players chooses the one opponent unasked", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, bears);
    const zenos = enter(game, "Zenos yae Galvus");
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    destroy(game, bears);
    expect(face(game, zenos)).toBe(1);
    expect(asked).toBe(false);
    expect(game.state.objects[zenos].chosenPlayer).toBe(B);
  });

  it("doesn't transform when another creature leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickPermanents(a, bears);
    const zenos = enter(game, "Zenos yae Galvus");
    destroy(game, giant);
    expect(face(game, zenos)).toBe(0);
  });

  it("gives every other creature -2/-2 when no opponent controls a creature (the ruling)", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", A);
    const zenos = enter(game, "Zenos yae Galvus");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(game.state.objects[zenos].chosenPermanent).toBeUndefined();
  });

  it("still spares the chosen creature when Zenos has left before the ability resolves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickPermanents(a, bears);
    const zenos = enter(game, "Zenos yae Galvus", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: zenos }]);
    settle(game);
    expect(zone(game, zenos)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });

  it("transforms when the chosen creature leaves for any zone — exiled, not only dying", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, bears);
    const zenos = enter(game, "Zenos yae Galvus");
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [{ kind: "object", object: bears }]);
    settle(game);
    expect(face(game, zenos)).toBe(1);
  });

  it("names the chosen creature only in the stint it was chosen in (rule 400.7)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    pickPermanents(a, bears);
    const zenos = enter(game, "Zenos yae Galvus");
    // Point the choice at a stint the bears have already left: their next
    // departure is a new object's, which doesn't transform Zenos.
    const chosen = game.state.objects[zenos].chosenPermanent;
    game.state.objects[zenos].chosenPermanent = { id: bears, stint: (chosen?.stint ?? 0) - 1 };
    destroy(game, bears);
    expect(face(game, zenos)).toBe(0);
    expect(zone(game, elves)).toBe("graveyard");
  });
});

describe("Shinryu, Transcendent Rival: the chosen player loses", () => {
  const transformed = (players: 2 | 4, pick: number): { game: Game; zenos: ObjectId } => {
    const t = table({ players });
    const bears = spawn(t.game, "Grizzly Bears", B);
    pickPermanents(t.a, bears);
    const zenos = enter(t.game, "Zenos yae Galvus");
    pickModes(t.a, pick);
    destroy(t.game, bears);
    return { game: t.game, zenos };
  };

  it("asks its controller to choose an opponent as it transforms, opponents in turn order from the next", () => {
    const t = table({ players: 4 });
    const bears = spawn(t.game, "Grizzly Bears", B);
    pickPermanents(t.a, bears);
    const zenos = enter(t.game, "Zenos yae Galvus");
    let offered: readonly string[] = [];
    t.a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [1];
    };
    destroy(t.game, bears);
    expect(offered).toEqual(["Choose Bob", "Choose Carol", "Choose Dave"]);
    expect(face(t.game, zenos)).toBe(1);
    expect(t.game.state.objects[zenos].chosenPlayer).toBe(C);
  });

  it("wins the game when the chosen player loses it", () => {
    const { game } = transformed(4, 1);
    lose(game, D);
    expect(game.state.result.over).toBe(false);
    lose(game, C);
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });

  it("wins the game when the chosen player concedes (rule 104.3a)", () => {
    const { game } = transformed(4, 0);
    game.concede(B);
    settle(game);
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });

  it("chooses nobody when it enters with its back face up, and wins nothing", () => {
    const { game } = table({ players: 4 });
    const shinryu = spawn(game, "Shinryu, Transcendent Rival", A);
    expect(game.state.objects[shinryu].chosenPlayer).toBeUndefined();
    lose(game, B);
    expect(game.state.result.over).toBe(false);
    expect(named(game, "Shinryu, Transcendent Rival")).toHaveLength(1);
  });
});
