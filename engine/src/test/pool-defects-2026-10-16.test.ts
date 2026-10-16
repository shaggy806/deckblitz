/**
 * Pool cards that played differently from their Oracle text, fixed
 * 2026-10-16 (the BACKLOG's card defects), on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, keywords, lands, life, nextTurn, ref, settle, spawn, table, toHand } from "./harness.js";

describe("Enter the God-Eternals", () => {
  const castAt = (withDictate: boolean): number => {
    const { game } = table();
    if (withDictate) spawn(game, "Dictate of the Twin Gods", B);
    lands(game, "Island", 3);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const before = life(game, A);
    cast(game, toHand(game, "Enter the God-Eternals"), { targets: [ref(bears), ref(B)] });
    return life(game, A) - before;
  };

  it("gains the 4 dealt", () => {
    expect(castAt(false)).toBe(4);
  });

  it("gains what was actually dealt — 8, doubled by Dictate of the Twin Gods", () => {
    expect(castAt(true)).toBe(8);
  });
});

describe("\"Its controller may search\" is theirs to decline", () => {
  it("Path to Exile: declining searches and shuffles nothing", () => {
    const { game, b } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    // An order Bob made (a scry, say) that a search would shuffle away.
    const top = game.debugSpawn("Forest", B, "library");
    const libraryBefore = [...game.state.zones.perPlayer[B].library];
    let asked = 0;
    b.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    cast(game, toHand(game, "Path to Exile"), { targets: [ref(bears)] });
    expect(asked).toBe(1);
    expect(game.state.objects[bears].zone).toBe("exile");
    expect(game.state.objects[top].zone).toBe("library");
    expect(game.state.zones.perPlayer[B].library).toEqual(libraryBefore);
  });

  it("Path to Exile: accepting finds the basic, tapped", () => {
    const { game, b } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = game.debugSpawn("Forest", B, "library");
    b.chooseModesFn = () => [0];
    b.chooseFromZoneFn = () => [forest];
    cast(game, toHand(game, "Path to Exile"), { targets: [ref(bears)] });
    expect(game.state.objects[forest].zone).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Atarka, World Render: a trigger object that blinked is a new object (rule 400.7)", () => {
  const attackAndMaybeBlink = (blink: boolean): boolean => {
    const { game, a } = table();
    spawn(game, "Atarka, World Render");
    const dragon = spawn(game, "Shivan Dragon");
    a.declareAttackersFn = () => [{ attacker: dragon, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    if (blink) {
      const move = (game as unknown as { moveObject(id: string, to: string): boolean }).moveObject.bind(game);
      move(dragon, "exile");
      move(dragon, "battlefield");
    }
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    return keywords(game, dragon).has("double-strike");
  };

  it("gives the attacking Dragon double strike", () => {
    expect(attackAndMaybeBlink(false)).toBe(true);
  });

  it("not the Dragon that returned after a blink in response", () => {
    expect(attackAndMaybeBlink(true)).toBe(false);
  });
});

describe("Lord of the Nazgûl: Wraiths you control have protection from Ring-bearers", () => {
  /** Whether bob's Prodigal Pyromancer may ping `id`. */
  const pingable = (game: ReturnType<typeof table>["game"], pyromancer: string, id: string): boolean =>
    game
      .legalActions(B)
      .some(
        (a) =>
          a.kind === "activate-ability" &&
          a.source === pyromancer &&
          (a.targetOptions?.[0] ?? []).some((t) => t.kind === "object" && t.object === id),
      );

  it("bob's creature can target the Lord until it's bob's Ring-bearer", () => {
    const { game } = table();
    const lord = spawn(game, "Lord of the Nazgûl");
    const pyromancer = spawn(game, "Prodigal Pyromancer", B);
    nextTurn(game); // bob's main phase, his priority
    expect(pingable(game, pyromancer, lord)).toBe(true);
    game.debugApplyEffect(B, { kind: "the-ring-tempts-you" });
    settle(game);
    expect(game.state.objects[pyromancer].ringBearer).toBe(B);
    expect(pingable(game, pyromancer, lord)).toBe(false);
  });
});

describe("The Aesir Escape Valhalla: a chapter ability remembers its Saga", () => {
  const setUp = () => {
    const t = table();
    const { game } = t;
    const wurm = game.debugSpawn("Craw Wurm", A, "graveyard"); // mana value 6
    const bears = spawn(game, "Grizzly Bears");
    const before = life(game, A);
    const saga = game.debugSpawn("The Aesir Escape Valhalla", A, "battlefield", { announceEntry: true });
    settle(game);
    return { ...t, wurm, bears, saga, before };
  };
  /** Run to the next chapter trigger on the stack (alice's next turn). */
  const toNextChapter = (game: ReturnType<typeof table>["game"]) => {
    const turn = game.state.turn.number;
    game.advanceUntil((s) => s.turn.number > turn + 1 && s.zones.shared.stack.length > 0);
  };

  it("exiles a permanent card, gains its mana value, grows a creature by it, then returns both", () => {
    const { game, wurm, bears, saga, before } = setUp();
    expect(game.state.objects[wurm].zone).toBe("exile");
    expect(life(game, A) - before).toBe(6);
    toNextChapter(game);
    settle(game);
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(6);
    toNextChapter(game);
    settle(game);
    expect(game.state.objects[wurm].zone).toBe("hand");
    expect(game.state.objects[saga].zone).toBe("hand");
  });

  it("II still reads the exiled card after the Saga is bounced in response", () => {
    const { game, bears, saga } = setUp();
    toNextChapter(game);
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [ref(saga)]);
    settle(game);
    expect(game.state.objects[saga].zone).toBe("hand");
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(6);
  });
});
